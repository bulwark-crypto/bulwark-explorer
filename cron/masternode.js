
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Masternode = require('../model/masternode');

/**
 * Get a list of the mns and request IP information
 * from freegeopip.net.
 */
async function syncMasternode() {
  // Increase the timeout for masternode.
  //@todo remove this and properly sync nodes instead
  rpc.timeout(10000); // 10 secs

  const date = moment().utc().startOf('minute').toDate();

  const mns = await rpc.call('masternode', ['list']);
  const newMasternodes = [];
  for (let mn of mns) {
    const masternode = new Masternode({
      active: mn.activetime,
      addr: mn.addr,
      createdAt: date,
      lastAt: new Date(mn.lastseen * 1000),
      lastPaidAt: new Date(mn.lastpaid * 1000),
      network: mn.network,
      rank: mn.rank,
      status: mn.status,
      txHash: mn.txhash,
      txOutIdx: mn.outidx,
      ver: mn.version
    });

    newMasternodes.push(masternode);
  }

  if (newMasternodes.length) {
    await Masternode.remove({});
    await Masternode.insertMany(newMasternodes);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'masternode';
  let code = 0;

  try {
    locker.lock(type);
    await syncMasternode();
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
