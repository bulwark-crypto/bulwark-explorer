
import config from '../config';
import { exit, rpc } from '../lib/cron';
import fetch from '../lib/fetch';
import moment from 'moment';
// Models.
import Coin from '../model/coin';

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function update() {
  const date = moment().startOf('minute').toDate();
  // Setup the coinmarketcap.com api url.
  const url = `${ config.coinMarketCap.api }${ config.coinMarketCap.ticker }`;

  try {
    const info = await rpc.call('getinfo');
    const market = await fetch(url);
    const masternodes = await rpc.call('masternode', ['list']);
    const nethashps = await rpc.call('getnetworkhashps');

    const coin = new Coin({
      cap: market.market_cap_usd,
      createdAt: date,
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
