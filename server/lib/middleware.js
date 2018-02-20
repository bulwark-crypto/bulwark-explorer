
import bodyParser from 'body-parser';
import logger from 'morgan';

const middleware = (app) => {
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // TODO: rate limiter for requests per second
  // TODO: timeout after 5 seconds
};

export default middleware;
