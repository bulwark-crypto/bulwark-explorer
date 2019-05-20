
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

/**
 * Process the blocks and transactions.
 * @param {Number} start The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
async function syncBlocks(start, stop, clean = false) {
  if (clean) {
    await Block.remove({ height: { $gte: start, $lte: stop } });
    await TX.remove({ blockHeight: { $gte: start, $lte: stop } });
    await UTXO.remove({ blockHeight: { $gte: start, $lte: stop } });
  }

  let block;
  for(let height = start; height <= stop; height++) {
    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

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
      txs: rpcblock.tx ? rpcblock.tx : [],
      ver: rpcblock.version
    });

    await block.save();

    await forEachSeries(block.txs, async (txhash) => {
      const rpctx = await util.getTX(txhash);

      if (blockchain.isPoS(block)) {
        await util.addPoS(block, rpctx);
      } else {
        await util.addPoW(block, rpctx);
      }
    });

    console.log(`Height: ${ block.height } Hash: ${ block.hash }`);
  }

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

  try {
    const info = await rpc.call('getinfo');
    const block = await Block.findOne().sort({ height: -1});

    let clean = true; // Always clear for now.
    let dbHeight = block && block.height ? block.height : 1;
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
    console.log(dbHeight, rpcHeight, clean);

    // Create the cron lock, if return is called below the finally will still be triggered releasing the lock without errors
    locker.lock(type);
    
    // If nothing to do then exit.
    if (dbHeight >= rpcHeight) {
      return;
    }
    // If starting from genesis skip.
    else if (dbHeight === 0) {
      dbHeight = 1;
    }

    await syncBlocks(dbHeight, rpcHeight, clean);
  } catch(err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch(err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
