import debounce from './debounce'

/**
 * This takes the usual debounce and adds immediate callback. 
 * @param {Function} callback What function to call after waitMs elapsed
 * @param {Number} waitMs How many miliseconds to wait (60 = 1 minute)
 */
const throttle = (callback, waitMs) => {
  return debounce(callback, waitMs, true);
}
module.exports = throttle;