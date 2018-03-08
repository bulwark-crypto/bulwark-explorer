
import { COIN, COINS, ERROR, TXS } from '../constants';
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
    getFromWorker('top100', resolve, reject);
  });
};

export const getTX = (query) => {
  return new promise((resolve, reject) => {
    getFromWorker('tx', resolve, reject, query);
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

export default {
  getBlock,
  getCoinHistory,
  getMNs,
  getPeers,
  getTop100,
  getTX,
  getTXs,
  getTXLatest
};
