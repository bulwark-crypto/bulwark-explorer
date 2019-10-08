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
}

module.exports = { secretsConfig }; // This is returned as an object on purpose so you have to be explicit at stating that you are accessing a secrets config