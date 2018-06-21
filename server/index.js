
require('babel-polyfill');
const cluster = require('cluster');

// Master
if (cluster.isMaster) {
  const cpus = require('os').cpus().length;

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    cluster.fork();
  });
}
// Worker
else {
  const config = require('../config');
  const db = require('../lib/db');
  const express = require('express');
  const mongoose = require('mongoose');
  // Application.
  const middleware = require('./lib/middleware');
  const router = require('./lib/router');

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
  app.listen(config.api.port, () => {
    console.log(`BlocEx running on port ${ config.api.port }`);
  });
}

// Export for testing.
module.exports =  app;
