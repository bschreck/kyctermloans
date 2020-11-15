import {JSO, Popup, Fetcher} from 'jso'

export var authenticateFn = function() {
    console.log("authenticating");
    let clientSecret = $("#client-secret")[0].value;
    let opts = {
      providerID: "coinbase",
      response_type: "code",
      client_id: "7eebc9df955a32bb612567e2e4ed4e14f6d1691ffe9f43ccc5e5f4866c862234",
      client_secret: clientSecret,
      redirect_uri: "https://benschreck.com/kyctermloans/dist/index.html",
      authorization: "https://www.coinbase.com/oauth/authorize",
      scopes: { request: ["wallet:user:read"]}
    };
    let client = new JSO(opts);
    client.callback();
    let token = client.getToken(opts);
    if (token !== null) {
      console.log("I got the token: ", token)
    }
    //client.wipeTokens();
    let f = new Fetcher(client)
    let url = 'https://api.coinbase.com/v2/user'
    f.fetch(url, {'token': token})
      .then((data) => {
        console.log("I got protected json data from the API", data)
      })
      .catch((err) => {
        console.error("Error from fetcher", err)
      })
};
