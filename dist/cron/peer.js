'use strict';

/**
 * Get a list of the peers and request IP information
 * from freegeopip.net.
 */
var update = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var _this = this;

    var date, peers, geoip, peer, url;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            date = (0, _moment2.default)().startOf('minute').toDate();
            _context2.prev = 1;
            _context2.next = 4;
            return _cron.rpc.call('getpeerinfo');

          case 4:
            peers = _context2.sent;
            geoip = void 0, peer = void 0, url = void 0;
            _context2.next = 8;
            return (0, _pIteration.forEach)(peers, function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(peer) {
                var parts;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        parts = peer.addr.split(':');


                        url = '' + _config2.default.freegeoip.api + parts[0];
                        _context.next = 4;
                        return (0, _fetch2.default)(url);

                      case 4:
                        geoip = _context.sent;


                        peer = new _peer2.default({
                          _id: geoip.ip,
                          country: geoip.country_name,
                          createdAt: date,
                          ip: geoip.ip,
                          lat: geoip.latitude,
                          lon: geoip.longitude,
                          port: parts[1] ? parts[1] : 0,
                          subver: peer.subver,
                          timeZone: geoip.time_zone,
                          ver: peer.version
                        });

                        // We are using the ip address as the id field so
                        // we will need to update or insert using upsert.
                        _context.next = 8;
                        return _peer2.default.findOneAndUpdate({ _id: peer._id }, peer, { upsert: true });

                      case 8:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 8:
            _context2.next = 14;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2['catch'](1);

            console.log(_context2.t0);
            (0, _cron.exit)(1);

          case 14:

            (0, _cron.exit)();

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 10]]);
  }));

  return function update() {
    return _ref.apply(this, arguments);
  };
}();

var _cron = require('../lib/cron');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _fetch = require('../lib/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _pIteration = require('p-iteration');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _peer = require('../model/peer');

var _peer2 = _interopRequireDefault(_peer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// Models.


update();