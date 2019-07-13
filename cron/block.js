
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const { IncomingWebhook } = require('@slack/client');
const locker = require('../lib/locker');
const util = require('./util');

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
 */
async function syncBlocks(start, stop, clean = false) {
  if (clean) {
    await Block.remove({ height: { $gt: start, $lte: stop } });
    await TX.remove({ blockHeight: { $gt: start, $lte: stop } });
    // await UTXO.remove({ blockHeight: { $gte: start, $lte: stop } });  // We will remove this in next patch
    await BlockRewardDetails.remove({ blockHeight: { $gt: start, $lte: stop } });
  }

  let blockSyncing = false;

  let block;
  for (let height = start + 1; height <= stop; height++) {

    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    if (blockSyncing) {
      throw "Block-overrun detected Only a single block should be running";
    }
    blockSyncing = true;

    block = new Block({
      hash,
      height,
      bits: rpcblock.bits,
      confirmations: rpcblock.confirmations,
      createdAt: new Date(rpcblock.time * 1000),
      diff: rpcblock.difficulty,
      merkle: rpcblock.merkleroot,
      nonce: rpcblock.nonce,
      prev: (rpcblock.height == 1) ? 'GENESIS' : rpcblock.previousblockhash ? rpcblock.previousblockhash : 'UNKNOWN',
      size: rpcblock.size,
      //txs: rpcblock.tx ? rpcblock.tx : [],
      ver: rpcblock.version
    });

    // Count how many inputs/outputs are in each block
    let vinsCount = 0;
    let voutsCount = 0;

    // Notice how we're ensuring to only use a single rpc call with forEachSeries()
    let rpctxs = [];
    let addedPosTxs = [];
    let txSyncing = false;
    await forEachSeries(rpcblock.tx, async (txhash) => {

      if (txSyncing) {
        throw "TX-overrun detected Only a single block should be running";
      }
      txSyncing = true;

      const rpctx = await util.getTX(txhash, true);
      console.log(txhash);

      rpctxs.push(rpctx);

      config.verboseCronTx && console.log(`txId: ${rpctx.txid}`);

      vinsCount += rpctx.vin.length;
      voutsCount += rpctx.vout.length;

      if (blockchain.isPoS(block)) {

        // Empty POS txs do not need to be processed
        if (util.isEmptyNonstandardTx(rpctx)) {
          return;
        }

        posTx = await util.addPoS(block, rpctx);
        addedPosTxs.push({ rpctx, posTx });
      } else {
        await util.addPoW(block, rpctx);
      }

      config.verboseCronTx && console.log(`tx added:(txid:${rpctx.txid}, id: ${posTx ? posTx._id : '*NO rpctx*'})\n`);

      txSyncing = false;
    });

    console.log('rpctxs:', height, rpctxs);

    // Carver2D
    await forEachSeries(rpctxs, async (rpctx) => {
      // Empty POS txs do not need to be processed
      if (util.isEmptyNonstandardTx(rpctx)) {
        return;
      }


    });

    // After adding the tx we'll scan them and do deep analysis
    await forEachSeries(addedPosTxs, async (addedPosTx) => {
      const { rpctx, posTx } = addedPosTx;
      if (posTx) {
        await util.performDeepTxAnalysis(block, rpctx, posTx);
      }
    });

    block.vinsCount = vinsCount;
    block.voutsCount = voutsCount;

    // Notice how this is done at the end. If we crash half way through syncing a block, we'll re-try till the block was correctly saved.
    await block.save();

    const syncPercent = ((block.height / stop) * 100).toFixed(2);
    console.dateLog(`(${syncPercent}%) Height: ${block.height}/${stop} Hash: ${block.hash} Txs: ${block.txs.length} Vins: ${vinsCount} Vouts: ${voutsCount}`);

    blockSyncing = false;
  }

  //@todo Remove the slack integration below:

  // Post an update to slack incoming webhook if url is
  // provided in config.js.
  if (block && !!config.slack && !!config.slack.url) {
    const webhook = new IncomingWebhook(config.slack.url);
    const superblock = await rpc.call('getnextsuperblock');
    const finalBlock = superblock - 1920;

    let text = '';
    // If finalization period is within 12 hours (12 * 60 * 60) / 90 = 480
    if (block.height == (finalBlock - 480)) {
      text = `
      Finalization window starts in 12 hours.\n
      \n
      Current block: ${block.height}\n
      Finalization block: ${finalBlock}\n
      Budget payment block: ${superblock}\n
      https://explorer.bulwarkcrypto.com/#/block/${block.height}\n
      `;
    }
    // If finalization block.
    else if (block.height == finalBlock) {
      text = `
      Finalization block!\n
      \n
      Block: ${block.height}\n
      https://explorer.bulwarkcrypto.com/#/block/${block.height}\n
      `;
    }
    // If budget payment block start then notify.
    else if (block.height == superblock) {
      text = `
      Governance payment(s) started!\n
      \n
      Block: ${block.height}\n
      https://explorer.bulwarkcrypto.com/#/block/${block.height}\n
      `;
    }
    // Just every block for now while testing.
    else {
      text = `Block: ${block.height}\n`;
    }

    if (!!text) {
      webhook.send(text, (err, res) => {
        if (err) {
          console.log('Slack Error:', err);
          return;
        }
        console.log('Slack Message:', res);
      });
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
    const block = await Block.findOne().sort({ height: -1 });

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
    await syncBlocks(dbHeight, rpcHeight, clean);
    config.verboseCron && console.dateLog(`Sync Finished!`);
  } catch (err) {
    console.dateLog(err);
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
