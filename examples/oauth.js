const creds = require('../lib/credentials.js')()
var util = require('util')
var OAuth = require('oauth')
var oauth = new OAuth.OAuth(
  'http://api.smugmug.com/services/oauth/1.0a/getRequestToken',
  'http://api.smugmug.com/services/oauth/1.0a/getAccessToken',
  creds.app_key,
  creds.app_secret,
  '1.0A',
  'oob',
  'HMAC-SHA1'
)

oauth.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
  if (error) console.log('error :', error)
  else {
    console.log('oauth_token :' + oauth_token)
    console.log('oauth_token_secret :' + oauth_token_secret)
    console.log('requestoken results :' + util.inspect(results))
    console.log('Requesting access token')

    oauth.get(
      'http://www.api.smugmug.com/api/v2/user/thomaswhite',
      oauth_token,
      oauth_token_secret,
      function (error, data, response) {
        if (error) console.error(error)
        console.log('data', data)
        // data = JSON.parse(data);
        // console.log(JSON.stringify(data, 0, 2));
        console.log(response)
      }
    )

    /*
        oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, function(error, oauth_access_token, oauth_access_token_secret, results2) {
          if(error) {
            console.log('error :',  util.inspect(error))
          } else {
            console.log('oauth_access_token :' + oauth_access_token)
            console.log('oauth_token_secret :' + oauth_access_token_secret)
            console.log('accesstoken results :' + util.inspect(results2))
            console.log("Requesting access token")
          }

    //      var data= "";
    //      oauth.getProtectedResource("http://term.ie/oauth/example/echo_api.php?foo=bar&too=roo", "GET", oauth_access_token, oauth_access_token_secret,  function (error, data, response) {
    //        console.log(data);
    //      });
        });
    */

  }
})
