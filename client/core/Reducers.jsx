
import { COIN, TXS } from '../constants';
import { combineReducers } from 'redux';

// The initial state of the coin object.
const coinInit = {
  blocks: 0, btc: 0, cap: 0, createdAt: 0,
  diff: 0, mnsOff: 0, mnsOn: 0, netHash: 0,
  peers: 0, status: 'Offline', supply: 0, usd: 0
};
/**
 * Will handle the coin key state.
 * @param {Object} state The current or default state.
 * @param {Object} action The flux compatible action.
 */
const coin = (state = coinInit, action) => {
  if (action.type === COIN) {
    return { ...action.payload };
  }
  return state;
};

/**
 * Will handle the updating of the state.
 * @param {Array} state The current or default list of transactions.
 * @param {Object} action The flux compatible action.
 */
const txs = (state = [], action) => {
  if (action.type === TXS) {
    return [ ...action.payload ];
  }
  return state;
};

// Export and combine our reducers.
export default combineReducers({
  coin,
  txs
});
