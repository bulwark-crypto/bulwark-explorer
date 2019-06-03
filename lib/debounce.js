/**
 * This takes the usual debounce and adds immediate callback. 
 * @param {Function} callback What function to call after waitMs elapsed
 * @param {Number} waitMs How many miliseconds to wait (60 = 1 minute)
 * @param {Boolean} isImmediate If isImmediate is true, The initial request would execute the callback instnaly. All other calls would have the expected delay
 */
const debounce = (callback, waitMs, isImmediate = false) => {
  let timeout;
  let isFired = false;
  return (...args) => {
    const context = this;
    clearTimeout(timeout);

    const callbackWrapper = () => {
      isFired = true;
      clearTimeout(timeout);
      callback.apply(context, args);
    };

    if (isImmediate && !isFired) {
      callbackWrapper();
      return;
    }

    timeout = setTimeout(callbackWrapper, waitMs);
    return timeout;
  };
}

module.exports = debounce;