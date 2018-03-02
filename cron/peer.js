
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
  const date = moment().startOf('minute').toDate();

  try {
    // Clear existing peer connections from database
    // on each run to keep it recent and accurate to
    // the live connections with the node.
    await Peer.remove({});

    const peers = await rpc.call('getpeerinfo');
    let geoip, peer, url;
    await forEach(peers, async (peer) => {
      const parts = peer.addr.split(':');

      url = `${ config.freegeoip.api }${ parts[0] }`;
      geoip = await fetch(url);

      peer = new Peer({
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

      // We are using the ip address as the id field so
      // we will need to update or insert using upsert.
      await Peer.findOneAndUpdate({ _id: peer._id }, peer, { upsert: true });
    });
  } catch(err) {
    console.log(err);
    exit(1);
  }

  exit();
}

update();
