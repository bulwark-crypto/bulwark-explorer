'use strict';

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
var update = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var date, url, info, market, masternodes, nethashps, coin;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            date = (0, _moment2.default)().startOf('minute').toDate();
            // Setup the coinmarketcap.com api url.

            url = '' + _config2.default.coinMarketCap.api + _config2.default.coinMarketCap.ticker;
            _context.prev = 2;
            _context.next = 5;
            return _cron.rpc.call('getinfo');

          case 5:
            info = _context.sent;
            _context.next = 8;
            return (0, _fetch2.default)(url);

          case 8:
            market = _context.sent;
            _context.next = 11;
            return _cron.rpc.call('getmasternodecount');

          case 11:
            masternodes = _context.sent;
            _context.next = 14;
            return _cron.rpc.call('getnetworkhashps');

          case 14:
            nethashps = _context.sent;
            coin = new _coin2.default({
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
            _context.next = 18;
            return coin.save();

          case 18:
            _context.next = 24;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context['catch'](2);

            console.log(_context.t0);
            (0, _cron.exit)(1);

          case 24:

            (0, _cron.exit)();

          case 25:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 20]]);
  }));

  return function update() {
    return _ref.apply(this, arguments);
  };
}();

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// Models.


update();