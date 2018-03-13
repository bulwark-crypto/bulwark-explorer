const APIdata = [
  {
    heading: 'API Calls',
    subHeading: 'Return data from coind',
    calls: [
        // {
        //   name: 'getAddress [hash]',
        //   info: 'Returns information for given address.',
        //   path: '/api/address/bFY9cyZqZTYHGfduXo7CVNTMiCDeJ1q4gA'
        // },
        { name: 'getBlock [hash] [height]',
          info: 'Returns block information for the given hash or height.',
          path: '/api/block/00000000000072a98f7d8385809a1f71af983d22efce85e63ec3d75f04412823'
        },
        {
          name: 'getCoin',
          info: 'Returns coin information.',
          path: '/api/coin/'
        },
        { name: 'getCoinHistory',
          info: 'Returns the coin history.',
          path: '/api/coin/history'
        },
        {
          name: 'getMasternodes',
          info: 'Returns masternode information.',
          path: '/api/masternode'
        },
        { name: 'getPeer',
          info: 'Returns peer information.',
          path: '/api/peer'
        },
        {
          name: 'getPeerHistory',
          info: 'Returns peer history.',
          path: '/api/peer/history'
        },
        // { name: 'getTop100',
        //   info: 'Returns top 100',
        //   path: '/api/top100'
        // },
        {
          name: 'getTXs',
          info: 'Returns transaction information.',
          path: '/api/tx'
        },
        { name: 'getTXLatest',
          info: 'Returns latest transaction information.',
          path: '/api/tx/latest'
        },
        {
          name: 'getTX',
          info: 'Returns information for the given transaction.',
          path: '/api/tx/790c2bdeb46189f180d4a83d7b16aa75a75da1b91d117fea7a7ae818239f0137'
        },
        {
          name: 'getDifficulty',
          info: 'Returns the current difficulty.',
          path: '/api/getdifficulty'
        },
        { name: 'getconnectioncount',
          info: 'Returns the number of connections the block explorer has to other nodes.',
          path: '/api/getconnectioncount'
        },
        { name: 'getblockcount',
          info: 'Returns the current block index.',
          path: '/api/getblockcount'
        },
        { name: 'getblock [hash]',
          info: 'Returns the information about the block with the given hash.',
          path: '/api/getblock?hash=000000000002a60bd9a1b8a065a53bfea15a1a59aa72f96836c2c448bef05156'
        },
        { name: 'getnetworkhashps',
          info: 'Returns the current network hashrate. (hash/s)',
          path: '/api/getnetworkhashps'
        },
    ]
  },
  {
    heading: 'Extended API',
    subHeading: 'Return data from local indexes',
    calls: [
        {
          name: 'getmoneysupply',
          info: 'Returns the current money supply.',
          path: '/ext/getmoneysupply'
        },
        // { name: 'getdistribution',
        //   info: 'Returns the number of connections the block explorer has to other nodes.',
        //   path: '/ext/getdistribution'
        // },
        // { name: 'getaddress',
        //   info: 'Returns address information.',
        //   path: '/ext/getaddress'
        // },
        { name: 'getbalance',
          info: 'Returns the current balance.',
          path: '/ext/getbalance'
        },
        { name: 'getlasttxs',
          info: 'Returns the last transactions.',
          path: '/ext/getlasttxs'
        }
    ]
  },
  {
    heading: 'Linking (GET)',
    subHeading: 'Linking to the block explorer',
    calls: [
        {
          name: 'transaction (tx/[hash])',
          info: 'Returns transaction information',
          path: '/#/tx/b1725bcb70b62faa0b273e5385b0225c2ef589bd638cfa582b6cb34f9430d0b9'
        },
        { name: 'block (block/[hash]',
          info: 'Returns block information.',
          path: '/#/block/000000000001eb792fe1ac3f901d2373509769f5179d9fe2fd3bf8cb3b6ebec9'
        },
        // { name: 'address (address/[hash]',
        //   info: 'Returns address information.',
        //   path: '/#/block/000000000001eb792fe1ac3f901d2373509769f5179d9fe2fd3bf8cb3b6ebec9'
        // },
        // { name: 'qr (qr/[hash]',
        //   info: 'Returns qr code information.',
        //   path: '/#/qr/000000000001eb792fe1ac3f901d2373509769f5179d9fe2fd3bf8cb3b6ebec9'
        // },
    ]
  }
]

export default APIdata;
