
/**
 * Web Worker
 * Handles the requesting of data in a separate thread
 * to prevent UI pausing.
 */

/**
 * Global configuration object.
 */
require('babel-polyfill');
const Promise = require('bluebird');
const fetch = require('./fetch');

const api = `${process.env.config.api.host}:${process.env.config.api.portWorker}${process.env.config.api.prefix}`;

// Get the address and all transactions related.
const getAddress = ({ address, ...query }) => fetch(`${api}/address/${address}`, query);

// Get the block and transactions.
const getBlock = query => fetch(`${api}/block/${query}`);

// Request the coins.
const getCoins = async (query) => {
  try {
    const coins = await fetch(`${api}/coin/history`, query);
    const avgBlockTime = await fetch(`${api}/block/average`); //@todo remove
    const avgMNTime = await fetch(`${api}/masternode/average`); // @todo remove

    return Promise.resolve(coins.map(c => ({ ...c, avgBlockTime, avgMNTime })));
  } catch (err) {
    console.log('fetch.worker ERROR:', err);
    return Promise.reject(err);
  }
};

// Request the coins for a week.
const getCoinsWeek = query => fetch(`${api}/coin/week`, query);

// Check if hash is a block.
const getIsBlock = query => fetch(`${api}/block/is/${query}`);

// Request the list of masternodes.
const getMNs = query => fetch(`${api}/masternode`, query);

// Request the list of connected peers.
const getPeers = () => fetch(`${api}/peer`);

// Request the supply information.
const getSupply = () => fetch(`${api}/supply`);

// Get the top 100 wallets.
const getTop100 = () => fetch(`${api}/top100`);

// Get transaction by its hash.
const getTX = query => fetch(`${api}/tx/${query}`);

// Request the transactions.
const getTXs = query => fetch(`${api}/tx`, query);

// Request the transactions.
const getPos = query => fetch(`${api}/pos`, query);

// Request the block rewards.
const getRewards = query => fetch(`${api}/rewards`, query);

// Request Carver2D Movements.
const getMovements = query => fetch(`${api}/movements`, query);

// Request Carver2D Movements.
const getTimeIntervals = query => fetch(`${api}/timeIntervals`, query);

// Request the transactions for a week.
const getTXsWeek = query => fetch(`${api}/tx/week`, query);

// Request the latest transactions.
const getTXsLatest = query => fetch(`${api}/tx/latest`, query);

// Handle incoming messages.
self.addEventListener('message', (ev) => {
  let action = null;
  switch (ev.data.type) {
    case 'address':
      action = getAddress;
      break;
    case 'block':
      action = getBlock;
      break;
    case 'coins':
      action = getCoins;
      break;
    case 'coins-week':
      action = getCoinsWeek;
      break;
    case 'is-block':
      action = getIsBlock;
      break;
    case 'peers':
      action = getPeers;
      break;
    case 'mns':
      action = getMNs;
      break;
    case 'supply':
      action = getSupply;
      break;
    case 'top-100':
      action = getTop100;
      break;
    case 'tx':
      action = getTX;
      break;
    case 'txs':
      action = getTXs;
      break;
    case 'pos':
      action = getPos;
      break;
    case 'rewards':
      action = getRewards;
      break;
    case 'movements':
      action = getMovements;
      break;
    case 'txs-latest':
      action = getTXsLatest;
      break;
    case 'txs-week':
      action = getTXsWeek;
      break;
    case 'timeIntervals':
      action = getTimeIntervals;
      break;
  }

  const wk = self;
  if (!action) {
    return wk.postMessage({ error: new Error('Type not found!') });
  }

  action(ev.data.query)
    .then((data) => {
      return wk.postMessage({ data, type: ev.data.type, id: ev.data.id });
    })
    .catch((err) => {
      return wk.postMessage({ ...err, type: ev.data.type, id: ev.data.id });
    });
});
