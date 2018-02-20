
import isofetch from 'isomorphic-fetch';
import promise from 'bluebird';

/**
 * Simple wrapper method around fetch to handle errors.
 * @param {String} url The url to make a GET request too.
 */
const fetch = (url) => {
  if (!url) {
    return promise.reject(new Error('Please provide a valid fetch url.'));
  }

  return isofetch(url).then((res) => {
    if (!res.ok || res.status >= 400) {
      throw new Error(`Bad request to coin market cap: ${ url }`);
    }
    return res.json();
  });
};

export default fetch;
