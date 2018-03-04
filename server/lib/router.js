
const express = require('express');
const path = require('path');
// Routes.
const api = require('../route/api');
const ext = require('../route/ext');

/**
 * Add routes for the application.
 * @param {Object} app The express app object.
 */
const router = (app) => {
  const webDir = path.join(__dirname, '../../', 'public');

  // Load the generated web file.
  app.use(express.static(webDir));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../', 'public', 'index.html'));
  });

  // Setup the api routes.
  app.use('/api', api);
  app.use('/ext', ext);
};

module.exports =  router;
