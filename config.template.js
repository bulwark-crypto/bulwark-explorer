
/**
 * Global configuration object.
 */
const config = {
  'api': {
    'host': 'https://explorer.bulwarkcrypto.com',
    'port': '3000',
    'portWorker': '443',
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
    'api': 'https://extreme-ip-lookup.com/json/'
  },
  'rpc': {
    'host': '127.0.0.1',
    'port': '52541',
    'user': 'bulwarkrpc',
    'pass': 'someverysafepassword',
    'timeout': 8000, // 8 seconds
  },
  'slack': {
    'url': 'https://hooks.slack.com/services/A00000000/B00000000/somekindofhashhere',
    //'channel': '#general',
    //'username': 'Block Report',
    //'icon_emoji': ':bwk:'
  },
  'community': {
    'highlightedAddresses': [
      { label: "Perpetual Community Funding", address: "bWKFundnxm6xtER3hX8gtYtZbVNTFEZ79u" }
    ]
  }
};

module.exports = config;
