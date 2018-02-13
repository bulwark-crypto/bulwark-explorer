
import 'babel-polyfill';
import config from './config';
import express from 'express';
import mongorito from 'mongorito';
import path from 'path';
// Middleware
import middleware from './middleware';
// Routes
import apiRoute from './route/api';
import fileRoute from './route/file';

// Connect to the database.
const dsn = `${ config.db.user }:${ config.db.pass }@${ config.db.host }:${ config.db.port }/${ config.db.name }`;
const db = new mongorito.Database(`mongodb://${ dsn }`);
const res = async () => await db.connect();

// Setup the application.
const app = express();

// Setup middleware for app.
middleware(app);

// Setup the routes.
app.get('/', fileRoute);
app.use('/api', apiRoute);

// Start the server.
app.listen(config.port, () => {
    console.log(`BlocEx running on port ${ config.port }`);
});

export default app;