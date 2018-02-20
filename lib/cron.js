
import 'babel-polyfill';
import 'bluebird';
import db from '../lib/db';
import mongoose from 'mongoose';
import RPC from '../lib/rpc';

// Handle missed promises.
process.on('unhandledRejection', (err) => {
  console.log(JSON.stringify(err));
});

// Connect to the database.
mongoose.connect(db.getDSN(), db.getOptions());

// Setup the error handler.
export const exit = (code = 0) => {
  try {
    mongoose.disconnect();
  } catch(err) {
    console.log('db:', err);
  } finally {
    process.exit(code);
  }
};

// Setup RPC node connection.
export const rpc = new RPC();

export default {
  exit,
  rpc
};
