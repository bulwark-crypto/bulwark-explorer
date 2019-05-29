/**
 * Global configuration object.
 */
const config = {
  api: {
    'host': 'https://explorer.bulwarkcrypto.com',
    'port': '3000',
    'portWorker': '443',
    'prefix': '/api',
    'timeout': '5s'
  },
  db: {
    'host': '127.0.0.1',
    'port': '27017',
    'name': 'blockex',
    'user': 'blockexuser',
    'pass': 'Explorer!1'
  },
  rpc: {
    'host': '127.0.0.1',
    'port': '52541',
    'user': 'bulwarkrpc',
    'pass': 'someverysafepassword',
    'timeout': 8000, // 8 seconds
  },
  splitRewardsData: false, //@plannedFeature If set to true extract out POS & MN Rewards into their own tables for additional explorer functionality (Setting to true now will not do anything)

  ///////////////////////////////
  // API & Social configurations
  ///////////////////////////////
  freegeoip: {
    'api': 'https://extreme-ip-lookup.com/json/'
  },
  coinMarketCap: {
    'api': 'http://api.coinmarketcap.com/v1/ticker/',
    'ticker': 'bulwark'
  },
  slack: {
    'url': 'https://hooks.slack.com/services/A00000000/B00000000/somekindofhashhere',
    //'channel': '#general',
    //'username': 'Block Report',
    //'icon_emoji': ':bwk:'
  },

  ///////////////////////////////
  /// Community & Address Related
  ///////////////////////////////
  community: {
    highlightedAddresses: [
      // If you comment out all of these addresses the "Community Addresses" section will not show up on the homepage. You can add as many addresses to highlight as you wish.
      //{ label: "Community Donations", address: "XXXXXXXXXXXXXXXXXXXXXXXXXXX" }, // Uncomment and replace with your coin address to highlight an address
      //{ label: "Community Funding", address: "XXXXXXXXXXXXXXXXXXXXXXXXXXX" }, // Uncomment and replace with your coin address to highlight any other address
    ]
  },
  // Each address can contain it's own set of widgets and configs for those widgets
  addressWidgets: {
    "XXXXXXXXXXXXXXXXXXXXXXXXXXX": {
      // WIDGET: Adds a list of masternodes when viewing address. We use this to show community-ran masternodes
      masternodesAddressWidget: {
        title: "Community Masternodes",
        description: "Profits from these masternodes fund & fuel community talent",
        isPaginationEnabled: false, // If you have more than 10 you should enable this
        addresses: [
          "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
          "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
          "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ]
      }
    }
  }
};

module.exports = config;