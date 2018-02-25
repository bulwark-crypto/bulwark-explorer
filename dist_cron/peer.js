'use strict';

require('babel-polyfill');

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

/**
 * Get a list of the peers and request IP information
 * from freegeopip.net.
 */
async function update() {
  const date = (0, _moment2.default)().startOf('minute').toDate();

  try {
    const peers = await _cron.rpc.call('getpeerinfo');
    let geoip, peer, url;
    await (0, _pIteration.forEach)(peers, async peer => {
      const parts = peer.addr.split(':');

      url = `${_config2.default.freegeoip.api}${parts[0]}`;
      geoip = await (0, _fetch2.default)(url);

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
      await _peer2.default.findOneAndUpdate({ _id: peer._id }, peer, { upsert: true });
    });
  } catch (err) {
    console.log(err);
    (0, _cron.exit)(1);
  }

  (0, _cron.exit)();
}
// Models.


update();