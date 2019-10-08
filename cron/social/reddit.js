
require('babel-polyfill');
const config = require('../../config');
const { exit, rpc } = require('../../lib/cron');
const fetch = require('../../lib/fetch');
const locker = require('../../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../../model/coin');
const { CarverAddress, CarverMovement } = require('../../model/carver2d');
const { CarverAddressType } = require('../../lib/carver2d');
const { TimeInterval } = require('../../model/timeInterval');
const { BlockRewardDetails } = require('../../model/blockRewardDetails');
const { TimeIntervalType, TimeIntervalColumn } = require('../../lib/timeInterval');

/**
 * Gets most reddit posts and stores them in db for later use
 */
const syncRedditPosts = async () => {
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'social_reddit';
  let code = 0;

  try {
    locker.lock(type);
    await syncRedditPosts();
  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
