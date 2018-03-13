
/**
 * Date
 *
 * Simple wrapper methods around moment.js.
 */
const moment = require('moment');

const dateFormat = (date, fmt = 'YYYY-MM-DD hh:mm:ss A') => {
  if (!date) {
    date = new Date();
  }

  return `${ moment(date).utc().format(fmt) } UTC`;
};

module.exports = {
  dateFormat
};
