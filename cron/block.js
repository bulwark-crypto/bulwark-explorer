
require('babel-polyfill');
const mongoose = require('mongoose');
const blockchain = require('../lib/blockchain');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
const carver2d = require('./carver2d');
const { CarverAddressType, CarverMovementType } = require('../lib/carver2d');
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

          //carver2d.fillAddressFriends(addressFromCache, parsedMovement.consolidatedAddressMovements); //@todo friend addresses

          if (movementData.amount < 0) {
            const from = addressFromCache;

            /*if (from.sequence > sequence) {
              throw `RECONCILIATION ERROR: Out-of-sequence from movement: ${from.sequence}>${sequence}`;
            }*/

            from.countOut++;
            from.balance -= -movementData.amount;
            from.valueOut += -movementData.amount;
            from.sequence = sequence;
            from.lastMovement = newCarverMovementId;
            addressesIn++;
            //canFlowSameAddress = true;
          } else {
            const to = addressFromCache;

            to.countIn++;
            to.balance += movementData.amount;
            to.valueIn += movementData.amount;
            to.sequence = sequence;
            to.lastMovement = newCarverMovementId;
            addressesOut++;
            //canFlowSameAddress = true;
          }

          // Do we need to insert or update this address? (if _id is null then add to batch insert otherwise batch updates)
          if (!addressFromCache._id) {
            addressFromCache._id = new mongoose.Types.ObjectId();
            addressFromCache.isNew = false; // Mark this mongoose document as not new (we're batch insert it outselves and next time we're calling .save() on it we want it to update instead of trying to insert)
            carverAddressesToInsert.push(addressFromCache);
          } else {
            carverAddressesToUpdate.push(addressFromCache);
          }

          updatedAddresses.set(addressFromCache.label, addressFromCache);

          let newCarverAddressMovement = new CarverAddressMovement({
            _id: new mongoose.Types.ObjectId(),
            carverAddress: addressFromCache._id,
            carverMovement: newCarverMovementId,
            amount: movementData.amount,
            balance: addressFromCache.balance - movementData.amount,
            sequence
          });
          newCarverAddressMovements.push(newCarverAddressMovement);
        });

        await UTXO.insertMany(parsedMovement.newUtxos);

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
          //@todo predictedAddressIn, predictedAddressOut
        });
        await newCarverMovement.save();

        //console.log(parsedMovement.newUtxos);
        //throw 'zz';


        // Insert any new addresses that were used in this tx
        await CarverAddress.insertMany(carverAddressesToInsert);

        // Update all addresses in parallel
        await Promise.all(carverAddressesToUpdate.map(
          async (updatedAddress) => {
            await updatedAddress.save();
          }));

        // Insert ledger movements for address
        await CarverAddressMovement.insertMany(newCarverAddressMovements);

        //throw 'done!';

        /*

        // Create our carver movement
        throw 'zz';
        const newCarverMovement = new CarverMovement(parsedMovement);
        await newCarverMovement.save();

        console.log('allUpdatedAddresses', newCarverMovement);

        throw 'xx';

        const lastFromMovement = from.lastMovement;

        if (from.sequence >= sequence) {
          throw `RECONCILIATION ERROR: Out-of-sequence from movement: ${from.sequence}>${sequence}`;
        }

        from.countOut++;
        from.balance -= parsedMovement.amount;
        from.valueOut += parsedMovement.amount;
        from.sequence = sequence;
        from.lastMovement = newCarverMovementId;
        canFlowSameAddress = true;

        updatedAddresses.set(from.label, from);

        //const to = updatedAddresses.has(parsedMovement.to.label) ? updatedAddresses.get(parsedMovement.to.label) : parsedMovement.to;
        const to = getCarverAddressFromCache(parsedMovement.to.label);
        let lastToMovement = lastFromMovement;
        if (from !== to) {
          lastToMovement = to.lastMovement;
        }

        if (to.sequence >= sequence && from !== to) {
          throw `RECONCILIATION ERROR: Out-of-sequence to movement: ${to.sequence}>${sequence}`;
        }

        to.countIn++;
        to.balance += parsedMovement.amount;
        to.valueIn += parsedMovement.amount;
        to.sequence = sequence;
        to.lastMovement = newCarverMovementId;
*/
        /*
        switch (parsedMovement.carverMovementType) {
          case CarverMovementType.PosRewardToTx:
            to.posMovement = parsedMovement._id;
            posRewardAmount = parsedMovement.amount; // Notice we're setting tx-wide pos reward
            break;
          case CarverMovementType.MasternodeRewardToTx:
            to.mnMovement = parsedMovement._id;
            break;
          case CarverMovementType.PowAddressReward:
            to.powCountIn++;
            to.powValueIn += parsedMovement.amount;
            break;
          case CarverMovementType.TxToPosAddress:
            // This gets set set in PosRewardToTx above (one per tx)
            if (posRewardAmount) {
              to.posCountIn++;
              to.posValueIn += posRewardAmount;
            }
            break;
          case CarverMovementType.TxToMnAddress:
            to.mnCountIn++;
            to.mnValueIn += parsedMovement.amount;
            break;
        }*/

        //updatedAddresses.set(to.label, to);

        //const contextAddress = to.carverAddressType === CarverAddressType.Address ? to._id : from._id;
        //const contextTx = to.carverAddressType === CarverAddressType.Tx ? to._id : from._id;
        /*
                let newCarverMovement = new CarverMovement({
                  _id: newCarverMovementId,
        
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
                  sequence,
                  lastFromMovement,
                  lastToMovement,
        
                  contextAddress,
                  //contextTx,
                  posRewardAmount: parsedMovement.posRewardAmount
                });
        
                switch (parsedMovement.carverMovementType) {
                  case CarverMovementType.PosRewardToTx:
                    newCarverMovement.posInputAmount = parsedMovement.posInputAmount;
                    newCarverMovement.posInputBlockHeightDiff = parsedMovement.posInputBlockHeightDiff;
                    break;
                }
        
                newMovements.push(newCarverMovement);
        
                // Erase the amount after first encounter (so we only set it once)
                if (parsedMovement.carverMovementType === CarverMovementType.TxToPosAddress) {
                  posRewardAmount = null;
                }
                //});
        
                // Insert movements first then update the addresses (that way the balances are correct on movements even if there is a crash during movements saving)
                await CarverMovement.insertMany(newMovements);
        
                // If we get to this step we have all the movements saved in order so we can resume from hard fail
                await Promise.all([...updatedAddresses.values()].map(
                  async (updatedAddress) => {
                    // Don't forget to update our cache with new address data
                    if (commonAddressCache.has(updatedAddress.label)) {
                      commonAddressCache.set(updatedAddress.label, updatedAddress);
                    }
                    if (normalAddressCache.has(updatedAddress.label)) {
                      normalAddressCache.set(updatedAddress.label, updatedAddress);
                    }
                    await updatedAddress.save();
                  }));
        */

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
    /*
        if (Math.floor((Math.random() * 100) + 1) < 5) {
          var dropNumBlocks = Math.floor((Math.random() * 10) + 1);
          console.log(`Dropping ${dropNumBlocks} blocks`)
          await undoCarverBlockMovements(height - dropNumBlocks + 1);
          height -= dropNumBlocks;
          commonAddressCache.clear(); // Clear cache because the addresses could now be invalid
        }*/

  }
}
/**
 * Unwind all movements in a block and delete the block & all movements / addresses created in this block (or after this block)
 */
async function undoCarverBlockMovements(height) {
  console.dateLog(`Undoing block ${height}`);
  await Block.remove({ height: { $gte: height } }); // Start with removing all the blocks (that way we'll get stuck in dirty state in case this crashses requiring to undo carver movements again)
  await UTXO.remove({ blockHeight: { $gte: height } }); // Start with removing all the blocks (that way we'll get stuck in dirty state in case this crashses requiring to undo carver movements again)

  let sequence = 0;

  // Iterate over movements 1000 at a time backwards through most recent movements that were created
  // These could be partial (if we failed saving some during last sync in case of hard reset)
  while (true) {

    let updatedAddresses = new Map();

    const parsedMovements = await CarverMovement
      .find({ blockHeight: { $gte: height } })
      .sort({ sequence: -1 })
      .limit(1000)
      .populate('from')
      .populate('to')
      .populate('lastFromMovement', { date: 1, sequence: 1 })
      .populate('lastToMovement', { date: 1, sequence: 1 });
    //.hint({ blockHeight: 1 }); // give indexing hint (otherwise blockHeight index might be picked instead and it's much slower as sorting is required)

    if (parsedMovements.length === 0) {
      console.log(`No more movements for block: ${height}`)
      break;
    }
    console.log(`Undoing ${parsedMovements.length} movements. Sequences ${parsedMovements[parsedMovements.length - 1].sequence} to ${parsedMovements[0].sequence}`)

    parsedMovements.forEach(parsedMovement => {
      sequence = parsedMovement.sequence;

      let canFlowSameAddress = false; // If addresses are same on same sequence continue. This way we can unwind movements and handle hard errors
      let from = null;

      // Notice that we check if .from and .to exist. It is possible to insert a new movement, update one address and the other one fails to save (ex: new address)
      // We can still undo the partial movement that was performed
      if (parsedMovement.from) {
        from = updatedAddresses.has(parsedMovement.from.label) ? updatedAddresses.get(parsedMovement.from.label) : parsedMovement.from;
        if (sequence === from.sequence) {
          from.countOut--;
          from.balance += parsedMovement.amount;
          from.valueOut -= parsedMovement.amount;
          canFlowSameAddress = true;

          if (parsedMovement.lastFromMovement) {
            from.lastMovement = parsedMovement.lastFromMovement._id;
            from.sequence = parsedMovement.lastFromMovement.sequence;
          } else {
            from.lastMovement = null;
            from.sequence = 0;
          }

          updatedAddresses.set(from.label, from);
        } else if (from.sequence > sequence) {
          throw `UNRECONCILIATION ERROR: Out-of-sequence from movement: ${from.sequence}>${sequence}`;
        }
      }

      if (parsedMovement.to) {
        const to = updatedAddresses.has(parsedMovement.to.label) ? updatedAddresses.get(parsedMovement.to.label) : parsedMovement.to;
        if (sequence === to.sequence || canFlowSameAddress && from === to) {
          to.countIn--;
          to.balance -= parsedMovement.amount;
          to.valueIn -= parsedMovement.amount;

          switch (parsedMovement.carverMovementType) {
            case CarverMovementType.PowAddressReward:
              to.powCountIn--;
              to.powValueIn -= parsedMovement.amount;
              break;
            case CarverMovementType.TxToPosAddress:
              // One of the POS movements to POS reward address will have this property
              if (parsedMovement.posRewardAmount) {
                to.posCountIn--;
                to.posValueIn -= parsedMovement.posRewardAmount;
              }
              break;
            case CarverMovementType.TxToMnAddress:
              to.mnCountIn--;
              to.mnValueIn -= parsedMovement.amount;
              break;
          }


          if (parsedMovement.lastToMovement) {
            to.lastMovement = parsedMovement.lastToMovement._id;
            to.sequence = parsedMovement.lastToMovement.sequence;
          } else {
            to.lastMovement = null;
            to.sequence = 0;
          }

          updatedAddresses.set(to.label, to);
        } else if (to.sequence > sequence) {
          throw `UNRECONCILIATION ERROR: Out-of-sequence from movement: ${to.sequence}>${sequence}`;
        }
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

    // Remove the movements carefully in order of sequence
    if (sequence > 0) {
      await CarverMovement.deleteMany({ sequence: { $gte: sequence } });
    }
  }

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
      if (lastCarverMovement && lastCarverMovement.sequence > block.sequenceEnd || lastCarverAddress && lastCarverAddress.sequence > block.sequenceEnd) {
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
