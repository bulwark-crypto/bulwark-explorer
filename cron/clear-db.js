
require('babel-polyfill');
const { exit, rpc } = require('../lib/cron');
const locker = require('../lib/locker');
// Models.
const Block = require('../model/block');
const Coin = require('../model/coin');
const Masternode = require('../model/masternode');
const Peer = require('../model/peer');
const Rich = require('../model/rich');
const TX = require('../model/tx');

/**
 * Clear database.
 */
async function clearDatabase() {
  await Block.remove({});
  await Coin.remove({});
  await Masternode.remove({});
  await Peer.remove({});
  await Rich.remove({});
  await TX.remove({});
}

/**
 * Handle locking.
 */
async function update() {
  let code = 0;

  try {
    locker.lock('block');
    locker.lock('coin');
    locker.lock('masternode');
    locker.lock('peer');
    locker.lock('rich');
    locker.lock('tx');
    await clearDatabase();
  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock('block');
      locker.unlock('coin');
      locker.unlock('masternode');
      locker.unlock('peer');
      locker.unlock('rich');
      locker.unlock('tx');
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
