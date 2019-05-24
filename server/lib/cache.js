const moment = require('moment');

/**
 * Basic caching in on
 * @param {Object} cacheName What is the key of the cache?
 * @param {Number} expiryUnixTimestamp When should the cache expire?
 * @param {Object} callback What callback to invoke if cache is missed?
 */

let cacheData = {};
let cacheUnixTimestamps = {};
const getFromCache = async (cacheName, expiryUnixTimestamp, callback) => {
  const currentUnixTimestamp = moment().utc().unix();
  if (!cacheData[cacheName] || cacheUnixTimestamps[cacheName] < currentUnixTimestamp) {
    cacheData[cacheName] = await callback();
    cacheUnixTimestamps[cacheName] = expiryUnixTimestamp;
  }
  return cacheData[cacheName];
};


module.exports =  {
  getFromCache
};