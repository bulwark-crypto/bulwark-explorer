
import 'babel-polyfill';
import config from '../config';
import db from '../lib/db';
import fetch from 'isomorphic-fetch';
import { forEach } from 'p-iteration';
import mongoose from 'mongoose';
import promise from 'bluebird';
import RPC from '../lib/rpc';
// Models.
import Coin from '../model/Coin';
import TX from '../model/tx';

// Handle missed promises.
process.on('unhandledRejection', (err) => {
  console.log(JSON.stringify(err));
});

// Connect to the database.
mongoose.connect(db.getDSN(), db.getOptions());

// Setup RPC node connection.
const rpc = new RPC();

// Setup the error handler.
const exit = (code = 0) => {
  mongoose.disconnect();
  process.exit(code);
};

// Setup the coinmarketcap.com api url.
const url = `${ config.coinMarketCap.api }${ config.coinMarketCap.ticker }`;

/**
 * Get coinmarketcap.com data for price and etc.
 */
async function getCoinMarketCapData() {
  return new promise((resolve, reject) => {
    fetch(url)
      .then((res) => {
        if (!res.ok || res.status >= 400) {
          throw new Error(`Bad request to coin market cap: ${ url }`);
        }
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json) && json.length) {
          json = json[0];
        }
        resolve(json);
      })
      .catch(reject);
  });
}

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function update() {
  try {
    const info = await rpc.call('getinfo');
    const market = await getCoinMarketCapData();
    const masternodes = await rpc.call('masternode', ['list']);
    const nethashps = await rpc.call('getnetworkhashps');

    const coin = new Coin({
      cap: market.market_cap_usd,
      createdAt: new Date(),
      blocks: info.blocks,
      btc: market.price_btc,
      diff: info.difficulty,
      mnsOff: masternodes.find(mn => !mn.activetime || mn.status !== 'ENABLED').length,
      mnsOn: masternodes.find(mn => !!mn.activetime || mn.status === 'ENABLED').length,
      netHash: nethashps,
      peers: info.connections,
      status: 'Online',
      supply: market.max_supply,
      usd: market.price_usd
    });

    await coin.save();
  } catch(err) {
    console.log(err);
    exit(1);
  }

  exit();
}

update();
