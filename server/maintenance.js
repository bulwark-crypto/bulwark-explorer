
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
        <title>Bulwark Explorer</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css.maps" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"> 
  <style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #080808;
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
}
a {
  border: none;
  outline: none;
  cursor: pointer;
}
.logo {
  margin: 0 auto;
  padding: 40px;
}
.logo img {
  width: 180px;
}
.container {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.container img {
  width: 25vw;
  min-width: 200px;
}
.container h1 {
  font-size: 48px;
}
.container p {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: rgba(255,255,255,0.72);
}
.container .button {
  border: none;
  outline: none;
  display:inline-block;
  position:relative;
  text-decoration:none;
  padding:1em 2em;
  background-color:rgba(41, 77, 234, 1);
  border-radius:4px;
  opacity:1;
  max-width:48%;
  font-weight: 600;
  text-transform: uppercase;
  color:#fff;
}
  </style>
  </head>
  <body>
    <div class="logo">
      <a href="https://bulwarkcrypto.com/">
        <img src="https://bulwarkcrypto.com/wp-content/uploads/2018/06/logo@2x.png" title="Bulwark Crypto"/>
      </a>
      </div>
    <div class="container">
        <img src="https://media.giphy.com/media/vIDsZm5DMZ5Ha/giphy.gif" title="Sad Explorer."/>
      <h1>Maintenance</h1>
      <p>Bulwark Explorer is not available at this moment.<br/>Please check back later.</p><br/>
  <a href="https://bulwarkcrypto.com/" class="button">Back to Main</a>
      </div>
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
