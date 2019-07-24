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

  ///////////////////////////////
  /// Community & Address Related
  ///////////////////////////////
  community: {
    // If you comment out all of these addresses the 'Community Addresses' section will not show up on the homepage. You can add as many addresses to highlight as you wish.
    highlightedAddresses: [
      //{ label: 'Community Donations', address: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX' }, // Uncomment and replace with your coin address to highlight an address
      //{ label: 'Community Funding', address: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX' }, // Uncomment and replace with your coin address to highlight any other address
    ],

    // It's hard to identify governance vs mn rewards in Dash. Add any governance addresses here, any masternode rewards into these addresses will count as governance reward instead of MN rewards
    governanceAddresses: [
      /**
       * If you have governance voting in your coin you can add the voting addresses to below.
       * This is only requried because governance rewards are simply replacing MN block reward (so they are identical on the blockchain)
       */

      /*
      // 72000 BWK 159ff849ae833c3abd05a7b36c5ecc7c4a808a8f1ef292dad0b02875009e009e
      "bZ1HJB1kEb1KFcVA42viGJPM7896rsRp9x",

      // 72000 BWK d35ed6e32886c108165c50235225da29ea3432404a4578831a8120b803e23f3d
      "bSP75eHtokmNq5n8iDVLbZVKuLAi8rN1KM",

      // 70000 BWK 5b3b0eec9271297a37c97fca1ecd98e033ea3813d8669346bfac0f08aa3142f8
      "bQockBvNDLUJ4zFV3g2EsymfuVxduWPpmA",

      // 45000 BWK 6a9fbf985e8d1737c3282d34759748ca02ab9c7893bd6d24dd5d72db66325707
      // 37000 BWK 3c1f46128606ddca07a4691f8697974c8789ca365c6f3ac8e7d866740450cb59
      "bR1Qa5HjuU8bN3J2WqrM2FSWzmk7RPyujp",

      // 25000 BWK 8ab5e85f2863afa1fdab187a2747d492a0d2a3903038063dbd5e187a76efdb03
      // 25000 BWK 98d82c3e6fd371daeaee45ed56875c413c5a6f596571fdb8888e8bf23b3e530c
      "bUagNLYEPmDTbnr7QgqFJidnASxvjNp2Kh",

      // 20000 BWK c86852e84b0c8d31af953ad75c42a6f581f8f2bb6f8835e7e9080694f92151c8
      // 20000 BWK 78bb316c7d66067df8d279a74c619aaac4b5412066ef0b87b9b6765960895ade
      // 50 BWK 22bc15f46408eeafe4b2ac6f54ddbb9c3b277848a44ae4db2da7100dda2da1ec
      "bVnzUZen6Sn473trmkd5vJ3zVMW8HwtnT9",

      // 16500 BWK 2fc3878768ff97cb67d8336a7e6fef50dab71696f9c5fe33d4b6226468609efe
      // 16500 BWK 9f011213e8b6890ab1ec66f037f1e16f3c8c138289877e0572b498aef31b3020
      // 16500 BWK ac562d3f239b2896d293b3126e83bbf6bef618ce59194657668b1b049dd094ad
      "bTHnr8H5anfhsx222Q5jgE3JjFog7pk5Cd"
      */
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
  /// Misc & Logging
  ///////////////////////////////
  verboseCron: true,      // If set to true there are extra logging details in cron scripts
  verboseCronTx: false,   // If set to true there are extra tx logging details in cron scripts (Not recommended)
  splitRewardsData: true, // Set to true to extract POS & MN data
};

module.exports = config;