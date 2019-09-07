
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
const { CarverAddress } = require('../model/carver2d')
// Models.
const Masternode = require('../model/masternode');

/**
 * Get a list of the mns 
 */
async function syncMasternode() {
  // Increase the timeout for masternode.
  //@todo remove this and properly sync nodes instead
  // Commented this out for now to see what effect it would have. Theoretically there shouldn't be any issues 
  //rpc.timeout(10000); // 10 secs

  const date = moment().utc().startOf('minute').toDate();

  const mns = await rpc.call('masternode', ['list']);
  const newMasternodes = [];
  const addressesToFetch = [];
  for (const mn of mns) {
    const masternode = {
      rank: mn.rank,
      network: mn.network,
      txHash: mn.txhash,
      txOutIdx: mn.outidx, // @todo rename to outidx
      status: mn.status,
      addr: mn.addr,
      ver: mn.version, //@todo rename to version
      lastAt: new Date(mn.lastseen * 1000), // @todo rename to lastseen
      active: mn.activetime, // @todo rename to activetime
      lastPaidAt: new Date(mn.lastpaid * 1000), // @todo rename to lastpaidat

      createdAt: date,
    };

    newMasternodes.push(new Masternode(masternode));

    addressesToFetch.push(masternode.addr);
    addressesToFetch.push(`${masternode.addr}:MN`);
  }


  const carverAddresses = await CarverAddress.find({ label: { $in: addressesToFetch } });
  newMasternodes.forEach(newMasternode => {
    const carverAddress = carverAddresses.find(carverAddress => carverAddress.label === newMasternode.addr);
    const carverAddressMn = carverAddresses.find(carverAddress => carverAddress.label === `${newMasternode.addr}:MN`);

    if (carverAddress) {
      newMasternode.carverAddress = carverAddress._id;
    }

    if (carverAddressMn) {
      newMasternode.carverAddressMn = carverAddressMn._id;
    }
  });


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
