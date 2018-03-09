
/**
 * Web Worker
 * Handles the requesting of data in a separate thread
 * to prevent UI pausing.
 */

/**
 * Global configuration object.
 */
const config = {
  api: {
    host: 'http://localhost', //'http://blockex.dustinengle.com',
    port: '3000',
    prefix: '/api'
  }
};
const fetch = require('./fetch');

const api = `${ config.api.host }:${ config.api.port }${ config.api.prefix }`;

// Get the block and transactions.
const getBlock = query => fetch(`${ api }/block/${ query }`);

// Request the coins.
const getCoins = query => fetch(`${ api }/coin/history`, query);

// Request the list of masternodes.
const getMNs = query => fetch(`${ api }/masternode`, query);

// Request the list of connected peers.
const getPeers = () => fetch(`${ api }/peer`);

// Get the top 100 wallets.
const getTop100 = () => fetch(`${ api }/top100`);

// Get transaction by its hash.
const getTX = query => fetch(`${ api }/tx/${ query }`);

// Request the transactions.
const getTXs = query => fetch(`${ api }/tx`, query);

// Request the latest transactions.
const getTXsLatest = query => fetch(`${ api }/tx/latest`, query);

// Handle incoming messages.
self.addEventListener('message', (ev) => {
  let action = null;
  switch (ev.data.type) {
    case 'block':
      action = getBlock;
      break;
    case 'coins':
      action = getCoins;
      break;
    case 'peers':
      action = getPeers;
      break;
    case 'mns':
      action = getMNs;
      break;
    case 'top100':
      action = getTop100;
      break;
    case 'tx':
      action = getTX;
      break;
    case 'txs':
      action = getTXs;
      break;
    case 'txs-latest':
      action = getTXsLatest;
      break;
  }

  if (!action) {
    self.postMessage({ error: new Error('Type not found!') });
    return;
  }

  action(ev.data.query)
    .then(data => self.postMessage({ data, type: ev.data.type }))
    .catch(error => self.postMessage({ error, type: ev.data.type }));
});
