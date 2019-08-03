
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
  await TX.remove({ blockHeight: { $gt: start, $lte: stop } }); //@todo this will be removed soon
  await BlockRewardDetails.remove({ blockHeight: { $gt: start, $lte: stop } }); //@todo this will be removed soon
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
      ver: rpcblock.version,
      isConfirmed: rpcblock.confirmations > config.blockConfirmations // We can instantly confirm a block if it reached the required number of confirmations (that way we don't have to reconfirm it later)
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
      const rpctx = await util.getTX(txhash, true);

      // Mongoose does not treat relationships as unique objects so when you perform comparsion on CarverAddress === CarverAddress you would get false even if they havee same _id
      // When we're updating address balances (based on movements) we'll store the address in a map as soon as it's update. That way we can fetch it again by _id
      let updatedAddresses = new Map();

      config.verboseCronTx && console.log(`txId: ${rpctx.txid}`);

      vinsCount += rpctx.vin.length;
      voutsCount += rpctx.vout.length;

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

        // We'll convert "required movements" into actual movements. (required movements = no async calls, parsing = async calls)
        const parsedMovements = await carver2d.parseRequiredMovements(params);

        let newMovements = [];
        parsedMovements.forEach(parsedMovement => {
          sequence++;

          const from = updatedAddresses.has(parsedMovement.from.label) ? updatedAddresses.get(parsedMovement.from.label) : parsedMovement.from;
          if (sequence > from.sequence) {
            from.countOut++;
            from.balance -= parsedMovement.amount;
            from.valueOut += parsedMovement.amount;
            from.sequence = sequence;
            from.lastMovementDate = blockDate;

            updatedAddresses.set(from.label, from);
          }

          const to = updatedAddresses.has(parsedMovement.to.label) ? updatedAddresses.get(parsedMovement.to.label) : parsedMovement.to;
          if (sequence > to.sequence) {
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

          if (sequence > sequences.movements) {

            const targetAddress = from.carverAddressType === CarverAddressType.Tx ? to._id : from._id;
            const targetTx = to.carverAddressType === CarverAddressType.Tx ? to._id : from._id;

            let newCarverMovement = new CarverMovement({
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
            });

            switch (parsedMovement.carverMovementType) {
              case CarverMovementType.PosRewardToTx:
                newCarverMovement.posInputAmount = parsedMovement.posInputAmount;
                newCarverMovement.posInputBlockHeight = parsedMovement.posInputBlockHeight;
                newCarverMovement.posInputBlockHeightDiff = parsedMovement.posInputBlockHeightDiff;
                break;
            }

            newMovements.push(newCarverMovement);

          }
        });

        // Insert movements first then update the addresses (that way the balances are correct on movements even if there is a crash during movements saving)
        await CarverMovement.insertMany(newMovements, { ordered: false }); // Doesn't matter how they're ordered because they'll be sorted by sequence
        await Promise.all([...updatedAddresses.values()].map(
          async (updatedAddress) => {
            await updatedAddress.save();
          }));
      }
    }

    // After adding the tx we'll scan them and do deep analysis
    await forEachSeries(addedPosTxs, async (addedPosTx) => {
      const { rpctx, posTx } = addedPosTx;
      if (posTx) {
        await util.performDeepTxAnalysis(block, rpctx, posTx);
      }
    });

    await TX.insertMany(newTxs);

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
 * Unwind all movements in a block and delete the block & all movements / addresses created in this block
 */
async function undoCarverBlockMovements(height) {
  console.dateLog(`Undoing block ${height}`);
  const block = await Block.findOne({ height });
  if (!block) {
    console.dateLog(`Can't undo block ${height} (not found)`);
    return;
  }

  let sequence = block.sequenceEnd;

  const addressTxs = await CarverAddress.find({ blockHeight: block.height, carverAddressType: CarverAddressType.Tx }).sort({ sequence: -1 });

  for (var txIndex = 0; txIndex < addressTxs.length; txIndex++) {
    const tx = addressTxs[txIndex];

    let updatedAddresses = new Map();

    const parsedMovements = await CarverMovement.find({ targetTx: tx._id }).sort({ sequence: -1 }).populate('from').populate('to');

    //@todo this is almost identical to moving and should be moved into a single function. We can then use a multiplier of -1 to achieve same functionality
    parsedMovements.forEach(parsedMovement => {
      sequence--;

      const from = updatedAddresses.has(parsedMovement.from.label) ? updatedAddresses.get(parsedMovement.from.label) : parsedMovement.from;
      if (sequence < from.sequence) {
        from.countOut--;
        from.balance += parsedMovement.amount;
        from.valueOut -= parsedMovement.amount;

        from.sequence = sequence;
        updatedAddresses.set(from.label, from);
      }

      const to = updatedAddresses.has(parsedMovement.to.label) ? updatedAddresses.get(parsedMovement.to.label) : parsedMovement.to;
      if (sequence < to.sequence) {
        to.countIn--;
        to.balance -= parsedMovement.amount;
        to.valueIn -= parsedMovement.amount;

        switch (parsedMovement.carverMovementType) {
          case CarverMovementType.TxToCoinbaseRewardAddress:
            to.powCountIn--;
            to.powValueIn -= parsedMovement.amount;
            break;
          case CarverMovementType.TxToPosAddress:
            if (to.posLastBlockHeight === height) {
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

              to.posCountIn--;
              to.posValueIn -= posRewardToTx.amount;

              to.posLastBlockHeight = height - 1;
            }

            break;
          case CarverMovementType.TxToMnAddress:
            to.mnCountIn--;
            to.mnValueIn -= parsedMovement.amount;
            break;
        }

        to.sequence = sequence;
        updatedAddresses.set(to.label, to);
      }
    });

    // Save addresses in parallel
    await Promise.all([...updatedAddresses.values()].map(
      async (updatedAddress) => {
        await updatedAddress.save();
      }));
  }

  // Finally after unwinding we can remove all addresses and movements
  await CarverMovement.remove({ blockHeight: { $gte: height } });
  await CarverAddress.remove({ blockHeight: { $gte: height } });

  // Remove non-carver data for this block
  await BlockRewardDetails.remove({ blockHeight: { $gte: height } });
  await TX.remove({ blockHeight: { $gte: height } });
  await Block.remove({ height: { $gte: height } });

}
/**
 * Recursive Sequential Blockchain Unreconciliation (Undo carver movements on last block if merkle roots don't match and re-run confirmations again otherwise confirm block)
 */
async function confirmBlocks(rpcHeight) {
  let startHeight = 1;

  const lastBlock = await Block.findOne().sort({ height: -1 });

  // Find most recently confirmed block (there might not be any)
  const lastConfirmedBlock = await Block.findOne({ isConfirmed: true }).sort({ height: -1 });
  if (lastConfirmedBlock) {
    startHeight = lastConfirmedBlock.height + 1;
  }
  if (startHeight >= rpcHeight) {
    console.dateLog(`No block confirmations required (All previous blocks have been confirmed)`);
    return;
  }
  console.dateLog(`Confirming Blocks (${startHeight} to ${rpcHeight})`);

  // Go through each block and ensure merkle root matches (if above config.blockConfirmations)
  for (var height = startHeight; height <= rpcHeight; height++) {
    config.verboseCron && console.dateLog(`Confirming block ${height}/${rpcHeight}...`);

    const block = await Block.findOne({ height });
    if (!block) {
      console.dateLog(`Block ${height} doesn't exist...`);
      break;
    }

    const hashOfBlockToConfirm = await rpc.call('getblockhash', [block.height]);
    const rpcBlockToConfirm = await rpc.call('getblock', [hashOfBlockToConfirm]);

    if (rpcBlockToConfirm.confirmations < config.blockConfirmations) {
      console.dateLog(`Stopping confirmations at block ${height}. Not enough confirmations. (${rpcBlockToConfirm.confirmations}/${config.blockConfirmations})`)
      break;
    } else if (block) {
      if (block.merkle != rpcBlockToConfirm.merkleroot) {
        console.log('Undoing last block...');

        await undoCarverBlockMovements(lastBlock.height);

        await confirmBlocks(rpcHeight); // Re-run block conifrms again to see if we need to undo another block
        return;
      } else {
        block.isConfirmed = true;
        await block.save();
      }
    }
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

    // Before syncing we'll confirm merkle root of X blocks back
    await confirmBlocks(info.blocks);

    const block = await Block.findOne().sort({ height: -1 });
    let sequence = block ? block.sequenceEnd : 0;

    let clean = true;
    let dbHeight = block && block.height ? block.height : 0;
    let rpcHeight = info.blocks;

    // If you pass in a parameter into the sync script then we will assume that this is the current tip
    // All blocks after this will be dirty and will be removed
    if (!isNaN(process.argv[2])) {
      clean = true;
      rpcHeight = parseInt(process.argv[2], 10);
    }

    console.dateLog(`DB Height: ${dbHeight}, RPC Height: ${rpcHeight}, Clean Start: (${clean ? "YES" : "NO"})`);

    // If last db block matches rpc block (or forced rpc block number) then no syncing is required
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
