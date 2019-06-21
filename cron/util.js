
require('babel-polyfill');
const mongoose = require('mongoose');
const config = require('../config');
const { rpc } = require('../lib/cron');
const blockchain = require('../lib/blockchain');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const BlockRewardDetails = require('../model/blockRewardDetails');

/**
 * Process the inputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 * @param {Number} blockHeight The block height for the tx.
 */
async function vin(rpctx, blockHeight) {
  // Setup the input list for the transaction.
  const txin = [];
  if (rpctx.vin) {

    // Figure out what txIds are used in all the inputs
    const usedTxIdsInVins = new Set();
    rpctx.vin.forEach((vin) => {
      if (vin.txid) {
        usedTxIdsInVins.add(vin.txid);
      }
    });

    const usedTxs = await TX.find({ txId: { $in: Array.from(usedTxIdsInVins) } }, { txId: 1, vout: 1, blockHeight: 1, createdAt: 1 }); // Only include vout, blockHeight & createdAt fields that we need

    const txIds = new Set();

    rpctx.vin.forEach((vin) => {
      let vinDetails = {
        coinbase: vin.coinbase,
        //sequence: vin.sequence,
        txId: vin.txid,
        vout: vin.vout
      };

      // Find the matching vout for vin and store extra metadata for vout
      if (vin.txid) {
        let shouldStoreRelatedVout = true;

        // Do not store zerocoin spend in relatedVout
        if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
          vinDetails.scriptSig = { asm: vin.scriptSig.asm }; // Will allow us to identify ZEROCOIN inputs on frontend
          shouldStoreRelatedVout = false;
        }

        if (shouldStoreRelatedVout) {
          const txById = usedTxs.find(usedTx => usedTx.txId == vin.txid);
          if (!txById) {
            // Verbose console outputs of the unsupported TX so we can easily debug TXs we don't support for inputs
            console.log("Unsupported TX:");
            console.log("===============");
            console.log(rpctx);
            console.log("===============");
            console.log(vin);
            throw `*** UNSUPPORTED BLOCKCHAIN: Could not find related TX: ${vin.txid}`;
          }

          const vinVout = txById.vout.find(vout => vout.n == vin.vout); // Notice how we are accessing by vout number instead of by index (as some vouts are not stored like POS)
          vinDetails.relatedVout = {
            value: vinVout.value,
            address: vinVout.address,
            confirmations: blockHeight - txById.blockHeight,
            date: txById.createdAt,
            age: rpctx.time - txById.createdAt.getTime() / 1000,
          };
        }
      }

      txin.push(vinDetails);

      txIds.add(`${vin.txid}:${vin.vout}`);
    });

    // Remove unspent transactions.
    if (txIds.size) {
      await UTXO.remove({ _id: { $in: Array.from(txIds) } });
    }
  }
  return txin;
}

/**
 * Process the outputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 * @param {Number} blockHeight The block height for the tx.
 */
async function vout(rpctx, blockHeight) {
  // Setup the outputs for the transaction.
  const txout = [];
  if (rpctx.vout) {
    const utxo = [];
    rpctx.vout.forEach((vout) => {
      if (vout.value <= 0 || vout.scriptPubKey.type === 'nulldata') {
        return;
      }

      let toAddress = 'NON_STANDARD';
      switch (vout.scriptPubKey.type) {
        case 'nulldata':
        case 'nonstandard':
          // These are known non-standard txouts that we won't store in txout
          break;
        case 'zerocoinmint':
          toAddress = 'ZEROCOIN';
          break;
        default:
          // By default take the first address as the "toAddress"
          toAddress = vout.scriptPubKey.addresses[0];
          break;
      }

      const to = {
        blockHeight,
        address: toAddress,
        n: vout.n,
        value: vout.value
      };

      // Always add UTXO since we'll be aggregating it in richlist
      utxo.push({
        ...to,
        _id: `${rpctx.txid}:${vout.n}`,
        txId: rpctx.txid
      });

      if (toAddress != 'NON_STANDARD') {
        txout.push(to);
      }
    });

    // Insert unspent transactions.
    if (utxo.length) {
      try {
        await UTXO.insertMany(utxo);
      } catch (ex) {
        console.log(`Failed to insert UTXO on block ${blockHeight}`);
        console.log(utxo);
        throw ex;
      }
    }
  }
  return txout;
}

/**
 * Process a proof of stake block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoS(block, rpctx) {
  // We will ignore the empty PoS txs.
  if (rpctx.vin[0].coinbase && rpctx.vout[0].value === 0)
    return;


  // Sync vout first then vins (because a block can have same input as output in the same block)
  const txout = await vout(rpctx, block.height);
  const txin = await vin(rpctx, block.height);

  // Give an ability for explorer to identify POS/MN rewards
  const isRewardRawTransaction = blockchain.isRewardRawTransaction(rpctx);

  let txDetails = {
    _id: new mongoose.Types.ObjectId(),
    //blockHash: block.hash,
    blockHeight: block.height,
    createdAt: block.createdAt,
    txId: rpctx.txid,
    version: rpctx.version,
    vin: txin,
    vout: txout,
    isReward: isRewardRawTransaction
  };

  // @Todo add POW Rewards (Before POS switchover)
  // If our config allows us to extract additional reward data
  if (!!config.splitRewardsData) {
    // If this is a rewards transaction fetch the pos & masternode reward details
    if (isRewardRawTransaction) {

      const currentTxTime = rpctx.time;

      const stakeInputTxId = rpctx.vin[0].txid;
      const stakedTxVoutIndex = rpctx.vin[0].vout;

      // Find details of the staked input
      const stakedInputRawTx = await getTX(stakeInputTxId, true); // true for verbose output so we can get time & confirmations

      const stakedInputRawTxVout = stakedInputRawTx.vout[stakedTxVoutIndex];

      const stakeInputValue = stakedInputRawTxVout.value;
      const stakedInputConfirmations = stakedInputRawTx.confirmations - rpctx.confirmations; // How many confirmations did we get on staked input before the stake occured (subtract the new tx confirmations)
      const stakedInputTime = stakedInputRawTx.time;

      const stakeRewardAddress = rpctx.vout[1].scriptPubKey.addresses[0];
      const stakeRewardAmount = rpctx.vout[1].value - stakeInputValue;
      const masternodeRewardAmount = rpctx.vout[2].value;
      const masternodeRewardAddress = rpctx.vout[2].scriptPubKey.addresses[0];

      // Allows us to tell if we've staked on an output of a stake reward (staking a stake)
      const isRestake = blockchain.isRewardRawTransaction(stakedInputRawTx);

      // Store all the block rewards in it's own indexed collection
      let blockRewardDetails = new BlockRewardDetails(
        {
          _id: new mongoose.Types.ObjectId(),
          //blockHash: block.hash,
          blockHeight: block.height,
          date: block.createdAt,
          txId: rpctx.txid,
          stake: {
            address: stakeRewardAddress,
            input: {
              txId: stakeInputTxId,
              value: stakeInputValue,
              confirmations: stakedInputConfirmations,
              date: new Date(stakedInputTime * 1000),
              age: currentTxTime - stakedInputTime,
              isRestake: isRestake,
              vinCount: rpctx.vin.length,
              voutCount: rpctx.vout.length
            },
            reward: stakeRewardAmount
          },
          masternode: {
            address: masternodeRewardAddress,
            reward: masternodeRewardAmount
          }
        }
      );

      txDetails.blockRewardDetails = blockRewardDetails._id; // Store the relationship to block reward details (so we don't have to copy data)

      await blockRewardDetails.save();
    }
  }

  addInvolvedAddresses(txDetails);

  await TX.create(txDetails);
}

/**
 * Handle a proof of work block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoW(block, rpctx) {
  // Sync vout first then vins (because a block can have same input as output in the same block)
  const txout = await vout(rpctx, block.height);
  const txin = await vin(rpctx, block.height);

  let txDetails = {
    _id: new mongoose.Types.ObjectId(),
    //blockHash: block.hash,
    blockHeight: block.height,
    createdAt: block.createdAt,
    txId: rpctx.txid,
    version: rpctx.version,
    vin: txin,
    vout: txout
  };

  addInvolvedAddresses(txDetails);

  await TX.create(txDetails);
}

/**
 * Store addresses involved in any vin or vouts, We'll use this as the basis for new "perfect ledger system" 
 * @param {String} tx Mongodb TX doc
 */
function addInvolvedAddresses(tx) {
  let involvedAddresses = new Set(); // Will store distinct addresses used in this transaction

  tx.vout.forEach(vout => {
    if (vout.address) {
      involvedAddresses.add(vout.address);
    }
  });
  tx.vin.forEach(vin => {
    if (vin.relatedVout) {
      involvedAddresses.add(vin.relatedVout.address);
    }
  });

  tx.involvedAddresses = Array.from(involvedAddresses);
}

/**
 * Will process the tx from the node and return.
 * @param {String} txhash The transaction hash string.
 * @param {Boolean} verbose     (bool, optional, default=false) If false, return a string, otherwise return a json object 
 */
async function getTX(txhash, verbose = false) {
  if (verbose) {
    const rawTransactionDetails = await rpc.call('getrawtransaction', [txhash, 1]);
    const hex = rawTransactionDetails.hex;
    let rawTransaction = await rpc.call('decoderawtransaction', [hex]);

    // We'll add some extra metadata to our transaction results (copy over confirmations, time & blocktime)
    rawTransaction.confirmations = rawTransactionDetails.confirmations;
    rawTransaction.time = rawTransactionDetails.time;
    rawTransaction.blocktime = rawTransactionDetails.blocktime;

    return rawTransaction;
  }
  const hex = await rpc.call('getrawtransaction', [txhash]);
  return await rpc.call('decoderawtransaction', [hex]);
}

module.exports = {
  addPoS,
  addPoW,
  getTX,
  vin,
  vout
};
