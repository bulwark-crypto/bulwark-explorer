const APIdata = [
  {
    heading: 'API Calls',
    subHeading: 'Return data from coind',
    calls: [
        {
          name: 'getDifficulty',
          info: 'Returns the current difficulty.',
          path: '/getdifficulty'
        },
        { name: 'getconnectioncount',
          info: 'Returns the number of connections the block explorer has to other nodes.',
          path: '/getconnectioncount'
        },
        { name: 'getblockcount',
          info: 'Returns the current block index.',
          path: '/getblockcount'
        },
        { name: 'getblockhash [index]',
          info: 'Returns the hash of the block at index.  (0 is the genesis block)',
          path: '/getblockhash'
        },
        { name: 'getblock [hash]',
          info: 'Returns the information about the block with the given hash.',
          path: '/getblock'
        },
        { name: 'getrawtransaction [txid][decrypt]',
          info: 'Returns raw transaction representation for given transaction id.  Decrypt can be set to 0(false) or 1(true).',
          path: '/getrawtransaction'
        },
        { name: 'getnetworkhashps',
          info: 'Returns the current network hashrate. (hash/s)',
          path: '/getnetworkhashps'
        },
    ]
  }
]

export default APIdata;
