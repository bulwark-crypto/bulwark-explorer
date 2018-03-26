
require('babel-polyfill');
const { exit } = require('../lib/cron');
const locker = require('../lib/locker');
// Models.
const Rich = require('../model/rich');
const UTXO = require('../model/utxo');

/**
 * Build the list of rich addresses from
 * unspent transactions.
 */
async function syncRich() {
  await Rich.remove({});

  const addresses = await UTXO.aggregate([
    { $group: { _id: '$address', sum: { $sum: '$value' } } },
    { $sort: { sum: -1 } },
    { $limit: 100 }
  ]);

  await Rich.insertMany(addresses.map(addr => ({
    address: addr._id,
    value: addr.sum
  })));
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'rich';
  let code = 0;

  try {
    locker.lock(type);
    await syncRich();
  } catch(err) {
    console.log(err);
    code = 1;
  } finally {
    locker.unlock(type);
    exit(code);
  }
}

update();
