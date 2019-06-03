/**
 * Throttle how often a callback can be executed consecutively
 * @param {Function} callback What function to call after waitMs elapsed
 * @param {Number} waitMs How many miliseconds to wait (60 = 1 minute)
 */
const throttle = (callback, waitMs) => {
  let timeout;
  let canFireInstantly = true;
  let shouldFire = true;

  return (...args) => {
    const context = this;
    clearTimeout(timeout);
    shouldFire = true;

    const callbackWrapper = () => {
      canFireInstantly = true;
      if (shouldFire) {
        callback.apply(context, args);
      }
    };

    if (canFireInstantly) {
      callback.apply(context, args);
      shouldFire = false;
      canFireInstantly = false;
      clearTimeout(timeout);
    }

    timeout = setTimeout(callbackWrapper, waitMs);
    return timeout;
  };
}

module.exports = throttle;