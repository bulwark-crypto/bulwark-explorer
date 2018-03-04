
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
    // Clear existing masternodes from database
    // on each run to keep it recent and accurate to
    // the live connections with the node.
    await Masternode.remove({});

    const mns = await rpc.call('masternode', ['list']);
    const inserts = [];
    await forEach(mns, async (mn) => {
      const mn = new Masternode({
        _id: mn.txhash,
        active: mn.activetime,
        createdAt: new Date(),
        lastAt: new Date(mn.lastseen * 1000),
        lastPaidAt: new Date(mn.lastpaid * 1000),
        network: mn.network,
        rank: mn.rank,
        status: mn.status,
        txHash: mn.txhash,
        txOutIdx: mn.outidx,
        ver: mn.version
      });

      inserts.push(mn);
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
