
/**
 * Global configuration object.
 */
const config = {
    'coinMarketCap': {
        'ticker': 'bulwark'
    },
    'db': {
        'host': '127.0.0.1',
        'port': '27017',
        'name': 'blockex',
        'user': 'blockexuser',
        'pass': 'Explorer!1'
    },
    'port': '3000',
    'rpc': {
        'host': '127.0.0.1',
        'port': '7777',
        'user': 'bwk',
        'pass': 'password',
        'timeout': 3000, // 3 seconds
    }
};

export default config;