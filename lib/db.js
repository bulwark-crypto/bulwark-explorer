
import config from '../config';
import promise from 'bluebird';

/**
 * Return the DSN string for the mongodb connection.
 */
export const getDSN = () => {
  return `mongodb://${ config.db.host }:${ config.db.port }/${ config.db.name }`;
};

/**
 * Return the options for the mongodb connection.
 */
export const getOptions = () => {
  return {
    auth: { authdb: config.db.name },
    native_parser: true,
    pass: config.db.pass,
    promiseLibrary: promise,
    user: config.db.user
  };
};

export default {
  getDSN,
  getOptions
};
