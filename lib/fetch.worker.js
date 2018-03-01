
/**
 * Web Worker
 * Handles the requesting of data in a separate thread
 * to prevent UI pausing.
 */
const config = require('../config');
const fetch = require('./fetch');

const api = `${ config.api.host }:${ config.api.port }${ config.api.prefix }`;

// Request the coins.
const getCoins = () => fetch(`${ api }/coin/history`);

// Request the transactions.
const getTXs = query => fetch(`${ api }/tx/latest`, query);

// Handle incoming messages.
self.addEventListener('message', (ev) => {
  const action = ev.data.type === 'coins' ? getCoins : getTXs;
  const query = ev.data.query ? ev.data.query : null;

  action(query)
    .then(res => self.postMessage({ data: res, type: ev.data.type }))
    .catch(error => self.postMessage({ error, type: ev.data.type }));
});
