/**
 * Locker
 *
 * Provide methods to lock cron tasks
 * so that multiple crons are not ran at once.
 */
const fs = require('fs');
const path = require('path');

/**
 * Get the path to the tmp folder cron lock file.
 * @param {String} type The cron name.
 */
const getPath = (type) => {
  return path.join(__dirname, '../tmp', `${ type }.cron_lock`);
};

/**
 * Create a new lock for the cron.
 * @param {String} type The cron name.
 */
const lock = (type) => {
  const p = getPath(type);
  const found = fs.existsSync(p);
  if (found) {
    throw new Error(`
      Lock found for '${ type }', cron may already be running.
      If not already running remove ${ type }.cron_lock and try again.
    `);
  }

  fs.writeFileSync(p, process.pid);
};

/**
 * Unlock the cron name.
 * @param {String} type The cron name.
 */
const unlock = (type) => {
  fs.unlinkSync(getPath(type));
};

module.exports = { lock, unlock };
