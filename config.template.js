/**
 * Global configuration object.
 */
const config = {
  api: {
    host: 'https://explorer.bulwarkcrypto.com',
    port: '3000',
    portWorker: '443',
    prefix: '/api',
    timeout: '5s'
  },
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
  coinDetails: {
    name: 'Bulwark',
    shortName: 'BWK',
    longName: 'Bulwark Cryptocurrency',
    coinNumberFormat: '0,0.0000',
    websiteUrl: 'https://bulwarkcrypto.com/'
  },

  ///////////////////////////////
  // API & Social configurations
  ///////////////////////////////
  freegeoip: {
    api: 'https://extreme-ip-lookup.com/json/'
  },
  coinMarketCap: {
    api: 'http://api.coinmarketcap.com/v1/ticker/',
    ticker: 'bulwark'
  },
  slack: {
    url: 'https://hooks.slack.com/services/A00000000/B00000000/somekindofhashhere',
    //'channel': '#general',
    //'username': 'Block Report',
    //'icon_emoji': ':bwk:'
  },

  ///////////////////////////////
  // Adjustable POS Profitability Score - How profitable is your staking, tailored for your blockchain
  ///////////////////////////////
  profitabilityScore: {
    /**
     * Figure out how profitable you are staking. Each output is multiplied by the number below, you can configure it for your blockchain
     * 
     * The formula is: (reward.stake.input.confirmations / ((reward.stake.reward / reward.stake.input.value) * 100)) * config.profitabilityScore.weightMultiplier
     */
    weightMultiplier: 0.1,

    /**
     * In order to get the color below (from scoreStyles) we'll use an exponential formula
     * 
     * The formula is: profitabilityScore < weightColorScale * Math.pow(2, i + 1) 
     */
    weightColorScale: 30,

    scoreStyles: [
      // Best case
      {
        color: '#72f87b',
        title: 'Rank 1/10 - Excellent!!!'
      },
      {
        color: '#84f771',
        title: 'Rank 2/10 - Excellent!'
      },
      {
        color: '#a0f771',
        title: 'Rank 3/10 - Excellent'
      },
      {
        color: '#bcf671',
        title: 'Rank 4/10 - Very Good'
      },
      {
        color: '#d8f671',
        title: 'Rank 5/10 - Above Average'
      },
      {
        color: '#f3f671',
        title: 'Rank 6/10 - Average'
      },
      {
        color: '#f5dc71',
        title: 'Rank 7/10 - Below Average'
      },
      {
        color: '#f5c071',
        title: 'Rank 8/10 - Not Optimal'
      },
      {
        color: '#f4a471',
        title: 'Rank 9/10 - Not Optimal!'
      },
      // Worst case (default)
      {
        color: '#f48871',
        title: 'Rank 10/10 - Not Optimal!!!'
      }
    ]
  },

  ///////////////////////////////
  /// Community & Address Related
  ///////////////////////////////
  community: {
    highlightedAddresses: [
      // If you comment out all of these addresses the 'Community Addresses' section will not show up on the homepage. You can add as many addresses to highlight as you wish.
      //{ label: 'Community Donations', address: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX' }, // Uncomment and replace with your coin address to highlight an address
      //{ label: 'Community Funding', address: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX' }, // Uncomment and replace with your coin address to highlight any other address
    ]
  },
  // Each address can contain it's own set of widgets and configs for those widgets
  addressWidgets: {
    'XXXXXXXXXXXXXXXXXXXXXXXXXXX': {
      // WIDGET: Adds a list of masternodes when viewing address. We use this to show community-ran masternodes
      masternodesAddressWidget: {
        title: 'Community Masternodes',
        description: 'Profits from these masternodes fund & fuel community talent',
        isPaginationEnabled: false, // If you have more than 10 you should enable this
        addresses: [
          'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
        ]
      }
    }
  },

  ///////////////////////////////
  /// Misc & Logging
  ///////////////////////////////
  verboseCron: true,      // If set to true there are extra logging details in cron scripts
  verboseCronTx: false,   // If set to true there are extra tx logging details in cron scripts (Not recommended)
  splitRewardsData: true, // Set to true to extract POS & MN data
};

module.exports = config;