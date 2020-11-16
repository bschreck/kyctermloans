import { AuthorizationCode } from 'simple-oauth2'
import { config } from './auth-config.js'
import regeneratorRuntime from "regenerator-runtime";

export var createApplication = function(app) {
  const client = new AuthorizationCode(config);
  const scope = 'wallet:user:read';
  const redirectUri = process.env.DOMAIN + '/auth/coinbase/callback';
  const authorizationUri = client.authorizeURL({
    redirect_uri: redirectUri,
    scope: scope,
    state: process.env.APP_SECRET
  });
  app.get('/auth', (req, res) => {
      console.log(authorizationUri);
      res.redirect(authorizationUri);
  });
  app.get('/auth/coinbase/callback', async (req, res) => {
      const { code } = req.query;
      const options = {
        code,
      };

      try {
        const accessToken = await client.getToken(options);

        console.log('The resulting token: ', accessToken.token);

        return res.status(200).json(accessToken.token);
      } catch (error) {
        console.error('Access Token Error', error.message);
        return res.status(500).json('Authentication failed');
      }
    });
}
