
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const moment = require('moment');
// Models.
const Peer = require('../model/peer');

/**
 * Get a list of the peers and request IP information
 * from freegeopip.net.
 */
async function update() {
  const date = moment().utc().startOf('minute').toDate();

  try {
    await Peer.remove({});

    const peers = await rpc.call('getpeerinfo');
    const inserts = [];
    await forEach(peers, async (peer) => {
      const parts = peer.addr.split(':');

      const url = `${ config.freegeoip.api }${ parts[0] }`;
      const geoip = await fetch(url);

      const p = new Peer({
        _id: geoip.ip,
        country: geoip.country_name,
        countryCode: geoip.country_code,
        createdAt: date,
        ip: geoip.ip,
        lat: geoip.latitude,
        lon: geoip.longitude,
        port: parts[1] ? parts[1] : 0,
        subver: peer.subver,
        timeZone: geoip.time_zone,
        ver: peer.version
      });

      inserts.push(p);
    });

    if (inserts.length) {
      await Peer.insertMany(inserts);
    }
  } catch(err) {
    console.log(err);
    exit(1);
  }

  exit();
}

update();
