
import bodyParser from 'body-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';

const webDir = path.join(__dirname, '../../', 'public');

const middleware = (app) => {
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(webDir));
    // TODO: rate limiter for requests per second
    // TODO: timeout after 5 seconds
};

export default middleware;