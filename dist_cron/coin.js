'use strict';

require('babel-polyfill');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _cron = require('../lib/cron');

var _fetch = require('../lib/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _coin = require('../model/coin');

var _coin2 = _interopRequireDefault(_coin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function update() {
  const date = (0, _moment2.default)().startOf('minute').toDate();
  // Setup the coinmarketcap.com api url.
  const url = `${_config2.default.coinMarketCap.api}${_config2.default.coinMarketCap.ticker}`;

  try {
    const info = await _cron.rpc.call('getinfo');
    const market = await (0, _fetch2.default)(url);
    const masternodes = await _cron.rpc.call('getmasternodecount');
    const nethashps = await _cron.rpc.call('getnetworkhashps');

    const coin = new _coin2.default({
      cap: market.market_cap_usd,
      createdAt: date,
      blocks: info.blocks,
      btc: market.price_btc,
      diff: info.difficulty,
      mnsOff: masternodes.total - masternodes.stable,
      mnsOn: masternodes.stable,
      netHash: nethashps,
      peers: info.connections,
      status: 'Online',
      supply: market.max_supply,
      usd: market.price_usd
    });

    await coin.save();
  } catch (err) {
    console.log(err);
    (0, _cron.exit)(1);
  }

  (0, _cron.exit)();
}
// Models.


update();