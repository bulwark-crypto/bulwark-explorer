
const { secretsConfig } = require('../config.server');
const promise = require('bluebird');

/**
 * Return the DSN string for the mongodb connection.
 */
const getDSN = () => {
  return `mongodb://${secretsConfig.db.host}:${secretsConfig.db.port}/${secretsConfig.db.name}`;
};

/**
 * Return the options for the mongodb connection.
 */
const getOptions = () => {
  return {
    auth: { authdb: secretsConfig.db.name },
    native_parser: true,
    pass: secretsConfig.db.pass,
    promiseLibrary: promise,
    user: secretsConfig.db.user
  };
};

module.exports = {
  getDSN,
  getOptions
};
