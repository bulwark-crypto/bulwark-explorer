
require('babel-polyfill');
const config = require('../../config');
const { secretsConfig } = require('../../config.server');
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
const snoowrap = require('snoowrap');

/**
 * Gets most reddit posts and stores them in db for later use
 */
const syncRedditPosts = async () => {

  // For more information go to https://github.com/not-an-aardvark/snoowrap
  // You will need to register your app on reddit: https://www.reddit.com/prefs/apps
  // You can generate these credentials via web interface: https://not-an-aardvark.github.io/reddit-oauth-helper/ 
  const r = new snoowrap({
    userAgent: 'Carver2D', // You can optionally override this in the social reddit config

    ...secretsConfig.social.reddit
  });

  const submissions = await r.getSubreddit(secretsConfig.social.reddit.subreddit).getNew()
  console.log(submissions);
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
