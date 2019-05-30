
require('babel-polyfill');
const config = require('../config');
const { rpc } = require('../lib/cron');
const blockchain = require('../lib/blockchain');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const BlockRewardDetails = require('../model/blockRewardDetails');

/**
 * Process the inputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 */
async function vin(rpctx) {
  // Setup the input list for the transaction.
  const txin = [];
  if (rpctx.vin) {
    const txIds = new Set();
    rpctx.vin.forEach((vin) => {
      txin.push({
        coinbase: vin.coinbase,
        sequence: vin.sequence,
        txId: vin.txid,
        vout: vin.vout
      });

      txIds.add(`${ vin.txid }:${ vin.vout }`);
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
        _id: `${ rpctx.txid }:${ vout.n }`,
        txId: rpctx.txid
      });

      if (toAddress != 'NON_STANDARD') {
        txout.push(to);
      }
    });

    // Insert unspent transactions.
    if (utxo.length) {
      await UTXO.insertMany(utxo);
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

  const txin = await vin(rpctx);
  const txout = await vout(rpctx, block.height);

  // Give an ability for explorer to identify POS/MN rewards
  const isRewardRawTransaction = blockchain.isRewardRawTransaction(rpctx);

  let txDetails = {
    _id: rpctx.txid,
    blockHash: block.hash,
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

      const stakeInputAmount = stakedInputRawTxVout.value;
      const stakedInputConfirmations = stakedInputRawTx.confirmations - rpctx.confirmations; // How many confirmations did we get on staked input before the stake occured (subtract the new tx confirmations)
      const stakedInputTime = stakedInputRawTx.time;

      const stakeRewardAddress = rpctx.vout[1].scriptPubKey.addresses[0];
      const stakeRewardAmount = rpctx.vout[1].value - stakeInputAmount;
      const masternodeRewardAmount = rpctx.vout[2].value;
      const masternodeRewardAddress = rpctx.vout[2].scriptPubKey.addresses[0];

      // You can see the schema for this object in model/schemas/blockRewardDetails
      const blockRewardDetails = {
        stake: {
          address: stakeRewardAddress,
          input: {
            txId: stakeInputTxId,
            amount: stakeInputAmount,
            confirmations: stakedInputConfirmations,
            date: new Date(stakedInputTime * 1000),
            age: currentTxTime - stakedInputTime,
          },
          reward: {
            amount: stakeRewardAmount,
            address: stakeRewardAddress
          }
        },
        masternode: {
          reward: {
            amount: masternodeRewardAmount,
            address: masternodeRewardAddress
          } 
        }
      }

      txDetails.blockRewardDetails = blockRewardDetails; // Notice how we're assigning the block reward to the TX as extra metadata

      // Store all the block rewards in it's own indexed collection
      const blockRewardDetailsObject = new BlockRewardDetails(
        {
          blockHash: block.hash,
          blockHeight: block.height,
          ...blockRewardDetails // Copy all properties to our new object
        }
      );
      await blockRewardDetailsObject.save();
    } 
  }

  await TX.create(txDetails);
}

/**
 * Handle a proof of work block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoW(block, rpctx) {
  const txin = await vin(rpctx);
  const txout = await vout(rpctx, block.height);

  await TX.create({
    _id: rpctx.txid,
    blockHash: block.hash,
    blockHeight: block.height,
    createdAt: block.createdAt,
    txId: rpctx.txid,
    version: rpctx.version,
    vin: txin,
    vout: txout
  });
}

/**
 * Will process the tx from the node and return.
 * @param {String} tx The transaction hash string.
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
