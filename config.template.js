
/**
 * Global configuration object.
 */
const config = {
  'api': {
    'host': 'http://explorer.bulwarkcrypto.com',
    'port': '80',
    'prefix': '/api',
    'timeout': '5s'
  },
  'coinMarketCap': {
    'api': 'https://api.coinmarketcap.com/v1/ticker/',
    'ticker': 'bulwark'
  },
  'db': {
    'host': '127.0.0.1',
    'port': '27017',
    'name': 'blockex',
    'user': 'blockexuser',
    'pass': 'Explorer!1'
  },
  'freegeoip': {
    'api': 'http://freegeoip.net/json/'
  },
  'rpc': {
    'host': '127.0.0.1',
    'port': '13000',
    'user': 'bwk',
    'pass': 'password',
    'timeout': 3000, // 3 seconds
  }
};

module.exports =  config;
