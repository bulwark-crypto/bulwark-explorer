
const isofetch = require('isomorphic-fetch');
const promise = require('bluebird');

const esc = encodeURIComponent;

/**
 * Will convert query params object into string value that
 * can be used in the request url.
 * @param {Object} query The key value object map for query params.
 */
const params = (query = {}) => {
  return Object.keys(query)
    .map(k => `${ esc(k) }=${ esc(query[k]) }`)
    .join('&');
};

/**
 * Simple wrapper method around fetch to handle errors.
 * Will handle the conversion of query into a query params
 * string and will convert the body into a string for transport.
 * @param {String} url The url to make a GET request too.
 */
const fetch = (url, query = null, body = null) => {
  if (!url) {
    return promise.reject(new Error('Please provide a valid fetch url.'));
  }

  // If query the setup url.
  if (query && typeof(query) === 'object') {
    url = `${ url }?${ params(query) }`;
  }

  // Setup the body and options.
  const options = {
    body: null,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'GET'
  };
  if (body && typeof(body) === 'object') {
    options.body = JSON.stringify(body);
  }

  return isofetch(url, options).then((res) => {
    if (!res.ok || res.status >= 400) {
      throw new Error(`Bad request to coin market cap: ${ url }`);
    }
    return res.json();
  });
};

module.exports =  fetch;
