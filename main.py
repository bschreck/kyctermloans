import os
import sys
import json
from fastapi import FastAPI
from fastapi.logger import logger
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse, RedirectResponse
from starlette.requests import Request
from pydantic import BaseSettings


class Settings(BaseSettings):
    BASE_URL = "http://localhost:8000"
    USE_NGROK = os.environ.get("USE_NGROK", "False") == "True"

settings = Settings()

def init_webhooks(base_url):
    # Update inbound traffic via APIs to use the public-facing ngrok URL
    pass

app = FastAPI()

config = Config('.env')
public_url = config.file_values.get('PUBLIC_DOMAIN')
if settings.USE_NGROK:
    # pyngrok should only ever be installed or initialized in a dev environment when this flag is set
    from pyngrok import ngrok

    # Get the dev server port (defaults to 8000 for Uvicorn, can be overridden with `--port`
    # when starting the server
    port = sys.argv[sys.argv.index("--port") + 1] if "--port" in sys.argv else 8000

    # Open a ngrok tunnel to the dev server
    public_url = ngrok.connect(port).public_url
    # Logger doesnt work for some reason
    logger.info("ngrok tunnel \"{}\" -> \"http://127.0.0.1:{}\"".format(public_url, port))
    print("ngrok tunnel \"{}\" -> \"http://127.0.0.1:{}\"".format(public_url, port))

    # Update any base URLs or webhooks to use the public ngrok URL
    settings.BASE_URL = public_url
    init_webhooks(public_url)

oauth = OAuth(config)
app.add_middleware(SessionMiddleware, secret_key=config.file_values['APP_SECRET'])
oauth.register(
    name='coinbase',
    authorize_url=config.file_values['COINBASE_DOMAIN'],
    access_token_url=config.file_values['COINBASE_ACCESS_TOKEN_URL'],
    authorize_params={'response_type': 'code'},
    client_id=config.file_values['CLIENT_ID'],
    client_secret=config.file_values['CLIENT_SECRET'],
    api_base_url=public_url,
    client_kwargs={
        'scope': 'wallet:user:read',
    }
)


@app.get('/')
async def homepage(request: Request):
    user = request.session.get('user')
    if user:
        data = json.dumps(user)
        html = (
            f'<pre>{data}</pre>'
            '<a href="/logout">logout</a>'
        )
        return HTMLResponse(html)
    return HTMLResponse('<a href="/login">login</a>')

@app.get('/cbuser')
async def homepage(request: Request):
    user = request.session.get('user')
    if user:
        data = json.dumps(user)
        cbdata = await oauth.coinbase.get(
            'https://api.coinbase.com/v2/user',
            token=user
        )
        return cbdata.json()
        # html = (
        #     f'<pre>{data}</pre>'
        #     '<a href="/logout">logout</a>'
        # )
        # return HTMLResponse(html)
    return HTMLResponse('<a href="/login">login</a>')

@app.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.coinbase.authorize_redirect(request, redirect_uri)

@app.route('/auth')
async def auth(request: Request):
    token = await oauth.coinbase.authorize_access_token(request)
    request.session['user'] = token
    return RedirectResponse(url='/')

@app.get('/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')
