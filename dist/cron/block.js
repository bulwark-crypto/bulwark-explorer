'use strict';

/**
 * Process the blocks and transactions.
 * @param {Number} current The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
var syncBlocks = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(current, stop) {
    var _this = this;

    var block, hash, rpcblock, height;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            block = void 0, hash = void 0, rpcblock = void 0;
            height = current;

          case 2:
            if (!(height < stop)) {
              _context3.next = 18;
              break;
            }

            _context3.next = 5;
            return _cron.rpc.call('getblockhash', [height]);

          case 5:
            hash = _context3.sent;
            _context3.next = 8;
            return _cron.rpc.call('getblock', [hash]);

          case 8:
            rpcblock = _context3.sent;


            block = new _block2.default({
              hash: hash,
              height: height,
              bits: rpcblock.bits,
              confirmations: rpcblock.confirmations,
              createdAt: new Date(rpcblock.time * 1000),
              diff: rpcblock.difficulty,
              merkle: rpcblock.merkleroot,
              nonce: rpcblock.nonce,
              prev: rpcblock.prevblockhash,
              size: rpcblock.size,
              txs: rpcblock.tx ? rpcblock.tx : [],
              ver: rpcblock.version
            });

            _context3.next = 12;
            return block.save();

          case 12:
            if (!block.height) {
              _context3.next = 14;
              break;
            }

            return _context3.delegateYield( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
              var hex, rpctx, tx;
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      hex = void 0, rpctx = void 0, tx = void 0;
                      _context2.next = 3;
                      return (0, _pIteration.forEach)(block.txs, function () {
                        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(txhash) {
                          var addrs, vout;
                          return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  _context.next = 2;
                                  return _cron.rpc.call('getrawtransaction', [txhash]);

                                case 2:
                                  hex = _context.sent;
                                  _context.next = 5;
                                  return _cron.rpc.call('decoderawtransaction', [hex]);

                                case 5:
                                  rpctx = _context.sent;


                                  // Setup the vout addresses.
                                  addrs = new Set();

                                  // Build the total for the output of this tx.

                                  vout = 0.0;

                                  if (rpctx.vout) {
                                    rpctx.vout.forEach(function (vo) {
                                      vout += vo.value;
                                      if (vo.scriptPubKey.addresses && vo.scriptPubKey.addresses.length) {
                                        vo.scriptPubKey.addresses.forEach(function (voa) {
                                          return addrs.add(voa);
                                        });
                                      }
                                    });
                                  }

                                  tx = new _tx2.default({
                                    vout: vout,
                                    addrs: Array.from(addrs),
                                    block: hash,
                                    createdAt: block.createdAt,
                                    hash: rpctx.txid,
                                    height: block.height,
                                    recipients: rpctx.vout.length,
                                    ver: rpctx.version
                                  });

                                  _context.next = 12;
                                  return tx.save();

                                case 12:
                                case 'end':
                                  return _context.stop();
                              }
                            }
                          }, _callee, _this);
                        }));

                        return function (_x3) {
                          return _ref2.apply(this, arguments);
                        };
                      }());

                    case 3:
                    case 'end':
                      return _context2.stop();
                  }
                }
              }, _callee2, _this);
            })(), 't0', 14);

          case 14:

            console.log('Height: ' + block.height + ' Hash: ' + block.hash);

          case 15:
            height++;
            _context3.next = 2;
            break;

          case 18:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function syncBlocks(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Get blockchain information from node and
 * update the database with the node.
 */


var update = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var info, block, height;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _cron.rpc.call('getinfo');

          case 3:
            info = _context4.sent;
            _context4.next = 6;
            return _block2.default.findOne().sort({ height: -1 });

          case 6:
            block = _context4.sent;
            height = block && block.height ? block.height : 0;
            _context4.next = 10;
            return syncBlocks(height, info.blocks);

          case 10:
            _context4.next = 16;
            break;

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4['catch'](0);

            console.log(_context4.t0);
            (0, _cron.exit)(1);

          case 16:

            (0, _cron.exit)();

          case 17:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 12]]);
  }));

  return function update() {
    return _ref3.apply(this, arguments);
  };
}();

var _cron = require('../lib/cron');

var _pIteration = require('p-iteration');

var _block = require('../model/block');

var _block2 = _interopRequireDefault(_block);

var _tx = require('../model/tx');

var _tx2 = _interopRequireDefault(_tx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// Models.


update();