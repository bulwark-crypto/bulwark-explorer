
require('babel-polyfill');
const mongoose = require('mongoose');
const blockchain = require('../lib/blockchain');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const carver2d = require('./carver2d');
const { CarverMovement, CarverAddress } = require('../model/carver2d');

// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const BlockRewardDetails = require('../model/blockRewardDetails');

/**
 * console.log but with date prepended to it
 */
console.dateLog = (...log) => {
  if (!config.verboseCron) {
    console.log(...log);
    return;
  }

  const currentDate = new Date().toGMTString();
  console.log(`${currentDate}\t`, ...log);
}

/**
 * Process the blocks and transactions.
 * @param {Number} start The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 * @param {Number} sequence For blockchain sequencing (last sequence of inserted block)
 */
async function syncBlocks(start, stop, sequence) {
  /*
  if (clean) {
    await Block.remove({ height: { $gt: start, $lte: stop } });
    await TX.remove({ blockHeight: { $gt: start, $lte: stop } });
    // await UTXO.remove({ blockHeight: { $gte: start, $lte: stop } });  // We will remove this in next patch
    await BlockRewardDetails.remove({ blockHeight: { $gt: start, $lte: stop } });
  }
  */

  const lastMovement = await CarverMovement.findOne().sort({ sequence: -1 });
  //const lastAddress = await CarverAddress.findOne().sort({ sequence: -1 });

  const sequences = {
    movements: lastMovement ? lastMovement.sequence : 0,
    //addresses: lastAddress ? lastAddress.sequence : 0,
  }

  // Instead of fetching addresses each tiem from db we'll store a certain number in cache (this is in config)
  let carverAddressCache = [];

  let block;
  for (let height = start + 1; height <= stop; height++) {

    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    const blockDate = new Date(rpcblock.time * 1000);
    block = new Block({
      _id: new mongoose.Types.ObjectId(),
      hash,
      height,
      bits: rpcblock.bits,
      confirmations: rpcblock.confirmations,
      createdAt: blockDate,
      diff: rpcblock.difficulty,
      merkle: rpcblock.merkleroot,
      nonce: rpcblock.nonce,
      prev: (rpcblock.height == 1) ? 'GENESIS' : rpcblock.previousblockhash ? rpcblock.previousblockhash : 'UNKNOWN',
      size: rpcblock.size,
      //txs: rpcblock.tx ? rpcblock.tx : [],
      txs: [],
      ver: rpcblock.version
    });

    const sequenceStart = sequence;

    // Count how many inputs/outputs are in each block
    let vinsCount = 0;
    let voutsCount = 0;

    // Notice how we're ensuring to only use a single rpc call with forEachSeries()
    let addedPosTxs = [];


    for (let txIndex = 0; txIndex < rpcblock.tx.length; txIndex++) {
      const txhash = rpcblock.tx[txIndex];

      const rpctx = await util.getTX(txhash, true);

      config.verboseCronTx && console.log(`txId: ${rpctx.txid}`);

      vinsCount += rpctx.vin.length;
      voutsCount += rpctx.vout.length;

      if (blockchain.isPoS(block)) {

        // Empty POS txs do not need to be processed
        if (util.isEmptyNonstandardTx(rpctx)) {
          continue;
        }

        posTx = await util.addPoS(block, rpctx);
        addedPosTxs.push({ rpctx, posTx });
      } else {
        await util.addPoW(block, rpctx);
      }

      config.verboseCronTx && console.log(`tx added:(txid:${rpctx.txid}, id: ${posTx ? posTx._id : '*NO rpctx*'})\n`);

      /**
       * Carver2D data analysis:
       */

      // Empty POS txs do not need to be processed
      if (!util.isEmptyNonstandardTx(rpctx)) {
        const vinRequiredMovements = carver2d.getVinRequiredMovements(rpctx);
        const voutRequiredMovements = carver2d.getVoutRequiredMovements(rpctx);

        const params = {
          rpcblock,
          rpctx,

          requiredMovements: vinRequiredMovements.concat(voutRequiredMovements),

          carverAddressCache
        };

        const parsedMovements = await carver2d.parseRequiredMovements(params);

        let updatedAddresses = new Map();

        let newMovements = [];
        parsedMovements.forEach(parsedMovement => {
          if (++sequence > sequences.movements) {
            newMovements.push(new CarverMovement({
              _id: new mongoose.Types.ObjectId(),

              label: parsedMovement.label,
              amount: parsedMovement.amount,

              date: blockDate,

              from: parsedMovement.from._id,
              to: parsedMovement.to._id,

              fromBalance: parsedMovement.from.balance,
              toBalance: parsedMovement.to.balance,

              carverMovementType: parsedMovement.carverMovementType,
              sequence: sequence
            }));
          }

          const from = updatedAddresses.has(parsedMovement.from.label) ? updatedAddresses.get(parsedMovement.from.label) : parsedMovement.from;
          if (++sequence > from.sequence) {
            from.countOut++;
            from.balance -= parsedMovement.amount;
            from.valueOut += parsedMovement.amount;
            from.sequence = sequence;
            from.lastMovementDate = blockDate;
            updatedAddresses.set(from.label, from);
          }

          const to = updatedAddresses.has(parsedMovement.to.label) ? updatedAddresses.get(parsedMovement.to.label) : parsedMovement.to;
          if (++sequence > to.sequence) {
            to.countIn++;
            to.balance += parsedMovement.amount;
            to.valueIn += parsedMovement.amount;
            to.sequence = sequence;
            to.lastMovementDate = blockDate;
            updatedAddresses.set(to.label, to);
          }
        });

        // A carver address should be created for each tx (the address label would be txid)
        const txCarverAddress = updatedAddresses.get(rpctx.txid);
        if (!txCarverAddress) {
          console.log(rpctx.txid);
          throw 'CARVER TX NOT CREATED?'
        }
        block.txs.push(txCarverAddress._id);

        await forEachSeries(Array.from(updatedAddresses.values()), async (updatedAddress) => {
          await updatedAddress.save();
        });

        await CarverMovement.insertMany(newMovements);
      }
    }

    // After adding the tx we'll scan them and do deep analysis
    await forEachSeries(addedPosTxs, async (addedPosTx) => {
      const { rpctx, posTx } = addedPosTx;
      if (posTx) {
        await util.performDeepTxAnalysis(block, rpctx, posTx);
      }
    });

    block.vinsCount = vinsCount;
    block.voutsCount = voutsCount;
    block.sequenceStart = sequenceStart;
    block.sequenceEnd = sequence;

    // Notice how this is done at the end. If we crash half way through syncing a block, we'll re-try till the block was correctly saved.
    await block.save();

    const syncPercent = ((block.height / stop) * 100).toFixed(2);
    console.dateLog(`(${syncPercent}%) Height: ${block.height}/${stop} Hash: ${block.hash} Txs: ${block.txs.length} Vins: ${vinsCount} Vouts: ${voutsCount}`);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'block';
  let code = 0;
  let hasAcquiredLocked = false;

  config.verboseCron && console.dateLog(`Block Sync Started`)
  try {
    // Create the cron lock, if return is called below the finally will still be triggered releasing the lock without errors
    // Notice how we moved the cron lock on top so we lock before block height is fetched otherwise collisions could occur
    locker.lock(type);
    hasAcquiredLocked = true;

    const info = await rpc.call('getinfo');
    const block = await Block.findOne().sort({ height: -1 });
    let sequence = block ? block.sequenceEnd : 0;

    let clean = true;
    let dbHeight = block && block.height ? block.height : 0; // Height + 1 because block is the last item inserted. If we have the block that means all data for that block exists
    let rpcHeight = info.blocks;

    // If heights provided then use them instead.
    if (!isNaN(process.argv[2])) {
      clean = true;
      dbHeight = parseInt(process.argv[2], 10);
    }
    if (!isNaN(process.argv[3])) {
      clean = true;
      rpcHeight = parseInt(process.argv[3], 10);
    }
    console.dateLog(`DB Height: ${dbHeight}, RPC Height: ${rpcHeight}, Clean Start: (${clean ? "YES" : "NO"})`);

    // If nothing to do then exit.
    if (dbHeight >= rpcHeight) {
      console.dateLog(`No Sync Required!`);
      return;
    }

    config.verboseCron && console.dateLog(`Sync Started!`);
    await syncBlocks(dbHeight, rpcHeight, sequence);
    config.verboseCron && console.dateLog(`Sync Finished!`);
  } catch (err) {
    console.log(err);
    console.dateLog(`*** Cron Exception!`);
    code = 1;
  } finally {
    // Try to release the lock if lock was acquired
    if (hasAcquiredLocked) {
      locker.unlock(type);
    }

    config.verboseCron && console.log(""); // Adds new line between each run with verbosity
    exit(code);
  }
}

update();
