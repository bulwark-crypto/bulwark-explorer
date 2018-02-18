
import 'babel-polyfill';
import config from '../config';
import db from '../lib/db';
import express from 'express';
import mongoose from 'mongoose';
// Application.
import middleware from './lib/middleware';
import router from './lib/router';

/* Database */
// Connect to the database.
mongoose.connect(db.getDSN(), db.getOptions());

/* API */
// Setup the application.
const app = express();
// Setup middleware for app.
middleware(app);
// Setup the routes.
router(app);
// Start the server.
app.listen(config.port, () => {
    console.log(`BlocEx running on port ${ config.port }`);
});

// Export for testing.
export default app;