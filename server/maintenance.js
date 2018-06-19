
require('babel-polyfill');
const config = require('../config');
const express = require('express');

/* API */
// Setup the application.
const app = express();
// Setup base default port.
app.use((req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>BlockEx - Blockchain Explorer</title>
        <style>
          body {
            text-align: center;
          }
        </style>
    </head>
    <body>
      <h1>Under Maintenance</h2>
      <h3>Check back soon!</h3>
    </body>
    </html>
  `);
});
// Start the server.
app.listen(config.api.port, () => {
  console.log(`BlocEx running on port ${ config.api.port }`);
});

// Export for testing.
module.exports =  app;
