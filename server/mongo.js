
const config = require('../config');
const db = require('../lib/db');
const mongoose = require('mongoose');

/* Validate Config */
if (!config.db.user || !config.db.pass) {
  console.log("Invalid user and/or password. User:", config.db.user, "Pass:", config.db.pass);
  process.exit(1);
}

/* Database */
// Connect to the database.
mongoose.connect(db.getDSN(), db.getOptions());

/* Add User */
// Create the database user.
mongoose.connection.db.addUser(config.db.user, config.db.pass);
