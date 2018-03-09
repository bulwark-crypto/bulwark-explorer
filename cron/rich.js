
require('babel-polyfill');
const { exit } = require('../lib/cron');
const { forEach } = require('p-iteration');
// Models.
const Rich = require('../model/rich');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');

/**
 * Build the list of rich addresses from
 * unspent transactions.
 */
async function update() {
  try {
    await Rich.remove({});

    // Clean up the rich list.
    const utxo = await UTXO.find();
    await forEach(utxo, async (tx) => {
      const count = TX.find({ 'vin.txid': tx.txId, 'vin.vout': tx.n }).size();
      if (count) {
        await UTXO.remove({ n: tx.n, txId: tx.txId });
      }
    });

    const addresses = await UTXO.aggregate([
      { $group: { _id: '$address', sum: { $sum: '$value' } } },
      { $sort: { sum: -1 } },
      { $limit: 100 }
    ]);

    await Rich.insertMany(addresses.map((addr) => {
      return new Rich({
        address: addr._id,
        value: addr.sum
      });
    }));
  } catch(err) {
    console.log(err);
    exit(1);
  }

  exit();
}

update();
