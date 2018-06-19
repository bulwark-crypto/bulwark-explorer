
const bodyParser = require('body-parser');
const config = require('../../config');
const cors = require('cors');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const timeout = require('connect-timeout');

/**
 * Will add middleware to the express app.
 * @param {Object} app The express app object.
 */
const middleware = (app) => {
  app.use(logger('dev'));
  app.use(timeout(config.api.timeout));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/api', new rateLimit({
    windowMs: 1000, // 1 second
    max: 10,
    //delayMs: 500
  }));

  app.use('/ext/getbalance', new rateLimit({
    windowMs: 1200,
    max: 1,
    //delayMs: 1000
  }));

};

module.exports =  middleware;
