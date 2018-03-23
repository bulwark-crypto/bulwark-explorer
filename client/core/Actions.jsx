
import { COIN, COINS, ERROR, TXS, WATCH } from '../constants';
import fetchWorker from '../../lib/fetch.worker';
import promise from 'bluebird';

const promises = new Map();
const worker = new fetchWorker();

worker.onerror = (err) => {
  console.log(err);
};

worker.onmessage = (ev) => {
  const p = promises.get(ev.data.type);
  if (!p) {
    return;
  }

  if (ev.data.error) {
    p.reject(ev.data.error);
    promises.delete(ev.data.type);
    return;
  }

  p.resolve(ev.data.data);
};

const getFromWorker = (type, resolve, reject, query = null) => {
  promises.set(type, { resolve, reject });
  worker.postMessage({ query, type });
};

export const getAddress = (query) => {
  return new promise((resolve, reject) => {
    getFromWorker('address', resolve, reject, query);
  });
};

export const getBlock = (query) => {
  return new promise((resolve, reject) => {
    getFromWorker('block', resolve, reject, query);
  });
};

export const getCoinHistory = (dispatch, query) => {
  return new promise((resolve, reject) => {
    getFromWorker(
      'coins',
      (payload) => {
        if (payload && payload.length) {
          dispatch({ payload: payload[0], type: COIN });
        }
        dispatch({ payload, type: COINS });
        resolve(payload);
      },
      (payload) => {
        dispatch({ payload, type: ERROR });
        reject(payload);
      },
      query
    );
  });
};

export const getCoinsWeek = () => {
  return new promise((resolve, reject) => {
    getFromWorker('coins-week', resolve, reject);
  });
};

export const getMNs = (query) => {
  return new promise((resolve, reject) => {
    getFromWorker('mns', resolve, reject, query);
  });
};

export const getPeers = () => {
  return new promise((resolve, reject) => {
    getFromWorker(
      'peers',
      (peers) => {
        resolve(peers.map((peer) => {
          const parts = peer.ip.split('.');
          parts[3] = 'XXX';
          peer.ip = parts.join('.');
          return peer;
        }));
      },
      reject
    );
  });
};

export const getTop100 = () => {
  return new promise((resolve, reject) => {
    getFromWorker('top-100', resolve, reject);
  });
};

export const getTX = (query) => {
  return new promise((resolve, reject) => {
    getFromWorker('tx', resolve, reject, query);
  });
};

export const getTXLatest = (dispatch, query) => {
  return new promise((resolve, reject) => {
    getFromWorker(
      'txs-latest',
      (payload) => {
        if (dispatch) {
          dispatch({ payload, type: TXS });
        }
        resolve(payload);
      },
      (payload) => {
        if (dispatch) {
          dispatch({ payload, type: ERROR });
        }
        reject(payload);
      },
      query
    );
  });
};

export const getTXs = (dispatch, query) => {
  return new promise((resolve, reject) => {
    getFromWorker(
      'txs',
      (payload) => {
        if (dispatch) {
          dispatch({ payload, type: TXS });
        }
        resolve(payload);
      },
      (payload) => {
        if (dispatch) {
          dispatch({ payload, type: ERROR });
        }
        reject(payload);
      },
      query
    );
  });
};

export const getTXsWeek = () => {
  return new promise((resolve, reject) => {
    getFromWorker('txs-week', resolve, reject);
  });
};

export const setTXs = (dispatch, txs) => {
  dispatch({ payload: txs, type: TXS });
};

export const setWatch = (dispatch, term) => {
  dispatch({ payload: term, type: WATCH });
};

export default {
  getAddress,
  getBlock,
  getCoinHistory,
  getCoinsWeek,
  getMNs,
  getPeers,
  getTop100,
  getTX,
  getTXLatest,
  getTXs,
  getTXsWeek,
  setTXs,
  setWatch
};
