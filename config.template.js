
/**
 * Global configuration object.
 */
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  'addressPrefix': 'b',
  'api': {
    'host': !isProduction ? 'localhost' : 'http://blockex.dustinengle.com',
    'port': !isProduction ? '3000' : '80',
    'prefix': '/api',
    'timeout': '5s'
  },
  'coinMarketCap': {
    'api': 'http://api.coinmarketcap.com/v1/ticker/',
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
    'port': '7777',
    'user': 'bwk',
    'pass': 'password',
    'timeout': 5000, // 5 seconds
  }
};

module.exports = config;
