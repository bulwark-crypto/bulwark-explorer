
require('babel-polyfill');
const mongoose = require('mongoose');
const blockchain = require('../lib/blockchain');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const carver2d = require('./carver2d');
const { CarverMovement, CarverAddress, CarverMovementType, CarverAddressType } = require('../model/carver2d');

// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
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

  //if (clean) {
  await Block.remove({ height: { $gt: start, $lte: stop } });
  await TX.remove({ blockHeight: { $gt: start, $lte: stop } });
  await BlockRewardDetails.remove({ blockHeight: { $gt: start, $lte: stop } });
  //}


  const lastMovement = await CarverMovement.findOne().sort({ sequence: -1 });
  //const lastAddress = await CarverAddress.findOne().sort({ sequence: -1 });

  //@todo Remove this and just delete perform cleaning (similar to above) removing all CarverAddress and CarverMovement with sequence above the syncBlocks(sequence)
  const sequences = {
    movements: lastMovement ? lastMovement.sequence : 0,
    //addresses: lastAddress ? lastAddress.sequence : 0,
  }

  // Instead of fetching addresses each tiem from db we'll store a certain number in cache (this is in config)
  const commonAddressCache = new Map();

  let block;
  for (let height = start + 1; height <= stop; height++) {

    if (config.verboseCronTx) {
      process.stdout.write("[block] ");
    }

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
    let newTxs = [];

    for (let txIndex = 0; txIndex < rpcblock.tx.length; txIndex++) {
      const txhash = rpcblock.tx[txIndex];

      if (config.verboseCronTx) {
        process.stdout.write("[getTX] ");
      }

      const rpctx = await util.getTX(txhash, true);

      // Mongoose does not treat relationships as unique objects so when you perform comparsion on CarverAddress === CarverAddress you would get false even if they havee same _id
      // When we're updating address balances (based on movements) we'll store the address in a map as soon as it's update. That way we can fetch it again by _id
      let updatedAddresses = new Map();

      config.verboseCronTx && console.log(`txId: ${rpctx.txid}`);

      vinsCount += rpctx.vin.length;
      voutsCount += rpctx.vout.length;

      if (config.verboseCronTx) {
        process.stdout.write("[oldSync] ");
      }

      //@todo remove this entirely (we can construct movements/latest txs on carver movements alone)
      if (blockchain.isPoS(block)) {

        // Empty POS txs do not need to be processed
        if (util.isEmptyNonstandardTx(rpctx)) {
          continue;
        }

        const posTx = await util.addPoS(block, rpctx);
        addedPosTxs.push({ rpctx, posTx });
        newTxs.push(posTx);
      } else {
        const powTx = await util.addPoW(block, rpctx);
        newTxs.push(powTx);
      }


      /**
       * Carver2D data analysis:
       */

      // Empty POS txs do not need to be processed
      if (!util.isEmptyNonstandardTx(rpctx)) {

        if (config.verboseCronTx) {
          process.stdout.write("[parse1] ");
        }

        // In the first sweep we'll analyze the "required movements". These should give us an idea of what addresses need to be loaded (so we don't have to do one address at a time)
        // Additionally we also flatten the vins/vouts into an array of movements
        const vinRequiredMovements = carver2d.getVinRequiredMovements(rpctx);
        const voutRequiredMovements = carver2d.getVoutRequiredMovements(rpctx);

        const params = {
          rpcblock,
          rpctx,

          requiredMovements: vinRequiredMovements.concat(voutRequiredMovements),

          commonAddressCache,
          updatedAddresses
        };

        if (config.verboseCronTx) {
          process.stdout.write("[parse2] ");
        }

        // We'll convert "required movements" into actual movements. (required movements = no async calls, parsing = async calls)
        const parsedMovements = await carver2d.parseRequiredMovements(params);

        if (config.verboseCronTx) {
          process.stdout.write("[update] ");
        }

        let newMovements = [];
        parsedMovements.forEach(parsedMovement => {

          const from = updatedAddresses.has(parsedMovement.from.label) ? updatedAddresses.get(parsedMovement.from.label) : parsedMovement.from;
          if (++sequence > from.sequence) {
            from.countOut++;
            from.balance -= parsedMovement.amount;
            from.valueOut += parsedMovement.amount;
            from.sequence = sequence;
            from.lastMovementDate = blockDate;

            switch (parsedMovement.carverMovementType) {
              case CarverMovementType.PosRewardToTx:
                from.posInputAmount = parsedMovement.posInputAmount;
                from.posInputBlockHeight = parsedMovement.posInputBlockHeight;
                from.posInputBlockHeightDiff = parsedMovement.posInputBlockHeightDiff;
                break;
            }

            updatedAddresses.set(from.label, from);
          }

          const to = updatedAddresses.has(parsedMovement.to.label) ? updatedAddresses.get(parsedMovement.to.label) : parsedMovement.to;
          if (++sequence > to.sequence) {
            to.countIn++;
            to.balance += parsedMovement.amount;
            to.valueIn += parsedMovement.amount;
            to.sequence = sequence;
            to.lastMovementDate = blockDate;

            switch (parsedMovement.carverMovementType) {
              case CarverMovementType.TxToCoinbaseRewardAddress:
                to.powCountIn++;
                to.powValueIn += parsedMovement.amount;
                break;
              case CarverMovementType.TxToPosAddress:

                // Because an output might contain multiple POS outputs we'll only track the first reward as the reward
                if (!to.posLastBlockHeight || to.posLastBlockHeight != rpcblock.height) {
                  // We already calculated total POS amount in PosRewardToTx. So we can just use that as the sum of all rewards
                  const posRewardToTx = parsedMovements.find(parsedMovement => parsedMovement.carverMovementType === CarverMovementType.PosRewardToTx);
                  if (!posRewardToTx) {
                    throw 'POS REWARDTOTX NOT FOUND?';
                  }

                  // We already calculated total POS amount in PosRewardToTx. So we can just use that as the sum of all rewards
                  const posTxIdVoutToTx = parsedMovements.find(parsedMovement => parsedMovement.carverMovementType === CarverMovementType.PosTxIdVoutToTx);
                  if (!posTxIdVoutToTx) {
                    throw 'POS TXID+VOUT NOT FOUND?';
                  }

                  to.posCountIn++;
                  to.posValueIn += posRewardToTx.amount;

                  to.posLastBlockHeight = rpcblock.height;

                }

                break;
              case CarverMovementType.TxToMnAddress:
                to.mnCountIn++;
                to.mnValueIn += parsedMovement.amount;
                break;

            }

            updatedAddresses.set(to.label, to);
          }

          if (++sequence > sequences.movements) {

            const targetAddress = from.carverAddressType === CarverAddressType.Tx ? to._id : from._id;
            const targetTx = to.carverAddressType === CarverAddressType.Tx ? to._id : from._id;

            newMovements.push(new CarverMovement({
              _id: new mongoose.Types.ObjectId(),

              label: parsedMovement.label,
              amount: parsedMovement.amount,


              date: blockDate,
              blockHeight: rpcblock.height,

              from: from._id,
              to: to._id,
              destinationAddress: parsedMovement.destinationAddress ? parsedMovement.destinationAddress._id : null,

              fromBalance: from.balance + parsedMovement.amount, // (store previous value before movement happened for perfect ledger)
              toBalance: to.balance - parsedMovement.amount, // (store previous value before movement happened for perfect ledger)

              carverMovementType: parsedMovement.carverMovementType,
              sequence: sequence,

              targetAddress,
              targetTx
            }));
          }
        });

        // A carver address should be created for each tx (the address label would be txid)
        /*const txCarverAddress = /*await CarverAddress.findOne({ label: rpctx.txid });//updatedAddresses.get(rpctx.txid);
        if (!txCarverAddress) {
          console.log(rpctx.txid);
          throw 'CARVER TX NOT CREATED?'
        }
        block.txs.push(txCarverAddress._id);*/


        if (config.verboseCronTx) {
          process.stdout.write("[save] ");
        }

        // Insert movements first then update the addresses (that way the balances are correct on movements even if there is a crash during movements saving)
        await CarverMovement.insertMany(newMovements, { ordered: false }); // Doesn't matter how they're ordered because they'll be sorted by sequence
        Array.from(updatedAddresses.values()).forEach(async (updatedAddress) => {
          await updatedAddress.save();
        });
      }
    }

    // After adding the tx we'll scan them and do deep analysis
    await forEachSeries(addedPosTxs, async (addedPosTx) => {
      const { rpctx, posTx } = addedPosTx;
      if (posTx) {
        await util.performDeepTxAnalysis(block, rpctx, posTx);
      }
    });

    if (config.verboseCronTx) {
      process.stdout.write("[saveOldTX] ");
    }
    await TX.insertMany(newTxs);


    if (config.verboseCronTx) {
      process.stdout.write("[block] ");
    }


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

    // Until we verify blocks properly we'll lag behind 10 blocks (This is a temporary fix)
    rpcHeight -= 10;

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
