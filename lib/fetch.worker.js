
/**
 * Web Worker
 * Handles the requesting of data in a separate thread
 * to prevent UI pausing.
 */
const config = require('../config');
const fetch = require('./fetch');

const api = `${ config.api.host }:${ config.api.port }${ config.api.prefix }`;

// Request the coins.
const getCoins = query => fetch(`${ api }/coin/history`, query);

// Request the list of connected peers.
const getPeers = () => fetch(`${ api }/peer`);

// Request the transactions.
const getTXs = query => fetch(`${ api }/tx/latest`, query);

// Handle incoming messages.
self.addEventListener('message', (ev) => {
  let action = null;
  switch (ev.data.type) {
    case 'coins':
      action = getCoins;
      break;
    case 'peers':
      action = getPeers;
      break;
    case 'txs':
      action = getTXs;
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
