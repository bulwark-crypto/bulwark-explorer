
import bodyParser from 'body-parser';
import config from '../../config';
import cors from 'cors';
import logger from 'morgan';
import rateLimit from 'express-rate-limit';
import timeout from 'connect-timeout';

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
    windowMs: 60000, // 1 minute
    max: 20,
    delayMs: 0
  }));
};

export default middleware;
