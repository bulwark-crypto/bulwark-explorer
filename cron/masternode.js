
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const moment = require('moment');
// Models.
const Masternode = require('../model/masternode');

/**
 * Get a list of the mns and request IP information
 * from freegeopip.net.
 */
async function update() {
  const date = moment().startOf('minute').toDate();

  try {
    await Masternode.remove({});

    const mns = await rpc.call('masternode', ['list']);
    const inserts = [];
    await forEach(mns, async (mn) => {
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

      inserts.push(masternode);
    });

    if (inserts.length) {
      await Masternode.insertMany(inserts);
    }
  } catch(err) {
    console.log(err);
    exit(1);
  }

  exit();
}

update();
