
require('babel-polyfill');
const mongoose = require('mongoose');
const blockchain = require('../lib/blockchain');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const carver2d = require('./carver2d');
const { CarverAddressType, CarverMovementType, CarverTxType } = require('../lib/carver2d');
const { CarverMovement, CarverAddress, CarverAddressMovement } = require('../model/carver2d');
const { UTXO } = require('../model/utxo');

// Models.
const Block = require('../model/block');
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
  let block = null;

  // Addresses like COINBASE, FEE, MN, POS, ZEROCOIN will be stored in common address cache (this cache is not cleared during sync as these are common addresses)
  const commonAddressCache = new Map();
  // Instead of fetching addresses each time from db we'll store a certain number in cache (this is in config)
  const normalAddressCache = new Map();

  /**
   * Fetches address from one of the caches above (we could potentially have more cache types in the future)
   */
  const getCarverAddressFromCache = (label) => {
    const commonAddressFromCache = commonAddressCache.get(label);
    if (commonAddressFromCache) {
      return commonAddressFromCache;
    }

    const normalAddressFromCache = normalAddressCache.get(label);
    if (normalAddressFromCache) {
      return normalAddressFromCache;
    }
    return null;
  }

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
      txs: [],
      ver: rpcblock.version,
      isConfirmed: rpcblock.confirmations > config.blockConfirmations // We can instantly confirm a block if it reached the required number of confirmations (that way we don't have to reconfirm it later)
    });

    // Flush cache every X addresses (set in config)
    if (normalAddressCache.size > config.blockSyncAddressCacheLimit) {
      normalAddressCache.clear();
    }


    const sequenceStart = sequence;

    // Count how many inputs/outputs are in each block
    let vinsCount = 0;
    let voutsCount = 0;


    for (let txIndex = 0; txIndex < rpcblock.tx.length; txIndex++) {
      const txhash = rpcblock.tx[txIndex];
      const rpctx = await util.getTX(txhash, false);

      sequence++;

      let updatedAddresses = new Map(); // @todo this could be a Set<CarverAddress> instead of Map<addressLabel,CarverAddress>


      config.verboseCronTx && console.log(`txId: ${rpctx.txid}`);

      vinsCount += rpctx.vin.length;
      voutsCount += rpctx.vout.length;

      // Start Carver2D Data Analysis. Empty POS txs do not need to be processed
      if (!util.isEmptyNonstandardTx(rpctx)) {
        // Get UTXOS for all inputs that have txid+vout
        const vinUtxos = await carver2d.getVinUtxos(rpctx);

        const params = {
          rpcblock,
          rpctx,

          commonAddressCache,
          normalAddressCache,
          vinUtxos
        };

        // Convert tx into new pending CarverMovement object
        const parsedMovement = await carver2d.getRequiredMovement(params);

        // Go through all used addresses in this tx and make sure they're loaded in cache (we will access the cache outside and we want all addresses to be there)
        await carver2d.fillAddressCache(params, parsedMovement.consolidatedAddressMovements);

        let newCarverAddressMovements = [];
        let carverAddressesToInsert = [];
        let carverAddressesToUpdate = [];
        let addressesIn = 0;
        let addressesOut = 0;

        const newCarverMovementId = new mongoose.Types.ObjectId();

        parsedMovement.consolidatedAddressMovements.forEach(movementData => {
          const addressFromCache = getCarverAddressFromCache(movementData.label);
          if (!addressFromCache) {
            throw `Could not find address: ${movementData.label}`
          }

          if (movementData.amountOut > 0) {
            addressFromCache.countOut++;
            addressFromCache.balance -= movementData.amountOut;
            addressFromCache.valueOut += movementData.amountOut;
            addressesIn++;
          }

          if (movementData.amountIn > 0) {
            addressFromCache.countIn++;
            addressFromCache.balance += movementData.amountIn;
            addressFromCache.valueIn += movementData.amountIn;
            addressesOut++;
          }

          addressFromCache.sequence = sequence;
          const lastMovement = addressFromCache.lastMovement;
          addressFromCache.lastMovement = newCarverMovementId;

          // Do we need to insert or update this address? (if _id is null then add to batch insert otherwise batch updates)
          if (!addressFromCache._id) {
            addressFromCache._id = new mongoose.Types.ObjectId();
            addressFromCache.isNew = false; // Mark this mongoose document as not new (we're batch insert it outselves and next time we're calling .save() on it we want it to update instead of trying to insert)
            carverAddressesToInsert.push(addressFromCache);
          } else {
            carverAddressesToUpdate.push(addressFromCache);
          }

          let newCarverAddressMovement = new CarverAddressMovement({
            _id: new mongoose.Types.ObjectId(),
            blockHeight: parsedMovement.blockHeight,

            carverAddress: addressFromCache._id,
            carverMovement: newCarverMovementId,
            amountIn: movementData.amountIn,
            amountOut: movementData.amountOut,
            balance: addressFromCache.balance - movementData.amount,
            sequence,
            previousAddressMovement: lastMovement
          });
          addressFromCache.lastMovement = newCarverAddressMovement._id;
          newCarverAddressMovements.push(newCarverAddressMovement);

          updatedAddresses.set(addressFromCache.label, addressFromCache);
        });

        await UTXO.insertMany(parsedMovement.newUtxos);

        const isReward = parsedMovement.txType === CarverTxType.ProofOfWork || parsedMovement.txType === CarverTxType.ProofOfStake;

        const newCarverMovement = new CarverMovement({
          _id: newCarverMovementId,
          txId: parsedMovement.txId,
          txType: parsedMovement.txType,
          amount: parsedMovement.amount,
          blockHeight: parsedMovement.blockHeight,
          date: parsedMovement.date,
          sequence,
          addressesIn,
          addressesOut,
          isReward
        });

        if (isReward) {
          //newCarverMovement.blockRewardDetails = await carver2d.getBlockRewardDetails(rpcblock, rpctx, parsedMovement); //@todo
        }
        await newCarverMovement.save();

        // Insert any new addresses that were used in this tx
        await CarverAddress.insertMany(carverAddressesToInsert);

        // Update all addresses in parallel
        await Promise.all(carverAddressesToUpdate.map(
          async (updatedAddress) => {
            await updatedAddress.save();
          }));

        // Insert ledger movements for address
        await CarverAddressMovement.insertMany(newCarverAddressMovements);
      }
    }

    block.vinsCount = vinsCount;
    block.voutsCount = voutsCount;
    block.sequenceStart = sequenceStart;
    block.sequenceEnd = sequence;

    // Notice how this is done at the end. If we crash half way through syncing a block, we'll re-try till the block was correctly saved.
    await block.save();

    const syncPercent = ((block.height / stop) * 100).toFixed(2);
    console.dateLog(`(${syncPercent}%) Height: ${block.height}/${stop} Hash: ${block.hash} Txs: ${rpcblock.tx.length} Vins: ${vinsCount} Vouts: ${voutsCount} Caches: ${normalAddressCache.size} (addresses)/${commonAddressCache.size} (common)`);


    // Uncomment to test unreconciliation (5% chance to unreconcile last 1-10 blocks)
    if (Math.floor((Math.random() * 100) + 1) < 5) {    //if (height % 3 == 0) {
      let dropNumBlocks = Math.floor((Math.random() * 10) + 1);
      console.log(`Dropping ${dropNumBlocks} blocks`)
      await undoCarverBlockMovements(height - dropNumBlocks + 1);
      height -= dropNumBlocks;

      // Clear caches because the addresses could now be invalid
      commonAddressCache.clear();
      normalAddressCache.clear(); // Clear cache because the addresses could now be invalid

      // Restore sequence to proper number
      const block = await Block.findOne().sort({ height: -1 });
      if (block) {
        sequence = block.sequenceEnd;
      } else {
        sequence = 0;
      }
    }

  }
}
/**
 * Unwind all movements in a block and delete the block & all movements / addresses created in this block (or after this block)
 */
async function undoCarverBlockMovements(height) {
  console.dateLog(`Undoing block > ${height}`);
  await Block.remove({ height: { $gte: height } }); // Start with removing all the blocks (that way we'll get stuck in dirty state in case this crashses requiring to undo carver movements again)
  await UTXO.remove({ blockHeight: { $gte: height } });

  let sequence = 0;

  // Iterate over movements 1000 at a time backwards through most recent movements that were created
  // These could be partial (if we failed saving some during last sync in case of hard reset)
  while (true) {

    let updatedAddresses = new Map();

    const parsedMovements = await CarverAddressMovement
      .find({ blockHeight: { $gte: height } })
      .sort({ sequence: -1 })
      .limit(1000)
      .populate('carverAddress')
      .populate('previousAddressMovement', { sequence: 1 });

    /*.populate('from')
    .populate('to')
    .populate('lastFromMovement', { date: 1, sequence: 1 })
    .populate('lastToMovement', { date: 1, sequence: 1 })*/
    //.hint({ blockHeight: 1 }); // give indexing hint (otherwise blockHeight index might be picked instead and it's much slower as sorting is required)

    if (parsedMovements.length === 0) {
      console.log(`No more movements for block: ${height}`)
      break;
    }
    console.log(`Undoing ${parsedMovements.length} movements. Sequences ${parsedMovements[parsedMovements.length - 1].sequence} to ${parsedMovements[0].sequence}`)

    parsedMovements.forEach(parsedMovement => {
      sequence = parsedMovement.sequence;

      const carverAddress = updatedAddresses.has(parsedMovement.carverAddress.label) ? updatedAddresses.get(parsedMovement.carverAddress.label) : parsedMovement.carverAddress;
      if (sequence === carverAddress.sequence) {
        if (parsedMovement.amountIn > 0) {
          carverAddress.countIn--;
          carverAddress.balance -= parsedMovement.amountIn;
          carverAddress.valueIn -= parsedMovement.amountIn;
        }
        if (parsedMovement.amountOut > 0) {
          carverAddress.countOut--;
          carverAddress.balance += parsedMovement.amountOut;
          carverAddress.valueOut -= parsedMovement.amountOut;
        }
        if (parsedMovement.previousAddressMovement) {
          carverAddress.lastMovement = parsedMovement.previousAddressMovement._id;
          carverAddress.sequence = parsedMovement.previousAddressMovement.sequence;
        } else {
          carverAddress.lastMovement = null;
          carverAddress.sequence = 0;
        }

        updatedAddresses.set(carverAddress.label, carverAddress);
      } else if (carverAddress.sequence > sequence) {
        throw `UNRECONCILIATION ERROR: Out-of-sequence carverAddress movement: ${carverAddress.sequence}>${sequence}`;
      }

    });

    /**
     * First we will ensure we save all addresses with the updated sequence.
     * If we fail anywhere here it's ok because we can resume without any errors.
     */
    await Promise.all([...updatedAddresses.values()].map(
      async (updatedAddress) => {
        await updatedAddress.save();
      }));


    if (sequence > 0) {
      await CarverAddressMovement.deleteMany({ sequence: { $gte: sequence } });
    }
  }

  await CarverMovement.deleteMany({ blockHeight: { $gte: height } });
  // Finally after unwinding we can remove all addresses that were created in/after this block
  await CarverAddress.remove({ blockHeight: { $gte: height } });
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

    if (!isNaN(process.argv[2])) {
      const undoHeight = parseInt(process.argv[2], 10);
      console.dateLog(`[CLEANUP] UNDOING all carver movements height >= ${undoHeight}`);
      await undoCarverBlockMovements(undoHeight); // Uncomment this to test unreconciling a bunch of blocks
      console.dateLog(`[CLEANUP] All movements unreconciled successfully!`);

      // Silently fail unlocking failure (worst case when you re-run normal version you will get same error and you can rm the file manually)
      try {
        locker.unlock(type);
      } catch (ex) { }

      return;
    }

    // Create the cron lock, if return is called below the finally will still be triggered releasing the lock without errors
    // Notice how we moved the cron lock on top so we lock before block height is fetched otherwise collisions could occur
    locker.lock(type);
    hasAcquiredLocked = true;
    const info = await rpc.call('getinfo');

    // Before syncing we'll confirm merkle root of X blocks back
    await confirmBlocks(info.blocks);

    const block = await Block.findOne().sort({ height: -1 });

    // Find any address/movement with sequence afer this block (so we can properly undo corrupt data)
    if (block) {
      const lastCarverMovement = await CarverMovement.findOne().sort({ sequence: -1 });
      const lastCarverAddress = await CarverAddress.findOne().sort({ sequence: -1 });

      if (lastCarverMovement && lastCarverMovement.sequence > block.sequenceEnd ||
        lastCarverAddress && lastCarverAddress.sequence > block.sequenceEnd) {
        console.dateLog("[CLEANUP] Partial block entry found, removing corrupt sync data");
        await undoCarverBlockMovements(block.height + 1);
      }
    } else {
      console.dateLog("[CLEANUP] No blocks found, erasing all carver movements");
      await undoCarverBlockMovements(1);
    }


    let sequence = block ? block.sequenceEnd : 0;

    let clean = true;
    let dbHeight = block && block.height ? block.height : 0;
    let rpcHeight = info.blocks;

    // If you pass in a parameter into the sync script then we will assume that this is the current tip
    // All blocks after this will be dirty and will be removed
    if (!isNaN(process.argv[3])) {
      clean = true;
      rpcHeight = parseInt(process.argv[3], 10);
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
