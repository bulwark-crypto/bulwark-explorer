/**
 * Keep all your API & secrets here. DO NOT IMPORT THIS FILE IN /client folder
 */
const secretsConfig = {
  db: {
    host: '127.0.0.1',
    port: '27017',
    name: 'blockex',
    user: 'blockexuser',
    pass: 'Explorer!1'
  },
  rpc: {
    host: '127.0.0.1',
    port: '52541',
    user: 'bulwarkrpc',
    pass: 'someverysafepassword',
    timeout: 8000, // 8 seconds
  },
  social: {
    reddit: {
      /**
       * You will need to register your app on reddit: https://www.reddit.com/prefs/apps
       * You can generate these credentials via web interface: https://not-an-aardvark.github.io/reddit-oauth-helper/ 
       * 
       * You will need [read] "Access posts and comments through my account" scope       * 
       **/
      clientId: 'put your client id here',
      clientSecret: 'put your client secret here',
      refreshToken: 'put your refresh token here',

      subreddit: 'MyAwesomeCoin' // /r/BulwarkCoin as an example
    }
  }
}

module.exports = { secretsConfig }; // This is returned as an object on purpose so you have to be explicit at stating that you are accessing a secrets config