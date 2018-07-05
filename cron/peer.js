
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Peer = require('../model/peer');

/**
 * Get a list of the peers and request IP information
 * from freegeopip.net.
 */
async function syncPeer() {
  const date = moment().utc().startOf('minute').toDate();

  const peers = await rpc.call('getpeerinfo');
  const inserts = [];
  await forEach(peers, async (peer) => {
    const parts = peer.addr.split(':');
    if (parts[0].substr(0, 1) === '[') {
      return;
    }

    const url = `${ config.freegeoip.api }${ parts[0] }`;
    let geoip = await fetch(url);

    const p = new Peer({
      _id: parts[0],
      country: geoip.country,
      countryCode: geoip.countryCode,
      createdAt: date,
      ip: parts[0],
      lat: geoip.lat,
      lon: geoip.lon,
      port: parts[1] ? parts[1] : 0,
      subver: peer.subver,
      timeZone: geoip.region,
      ver: peer.version
    });

    inserts.push(p);
  });

  if (inserts.length) {
    await Peer.remove({});
    await Peer.insertMany(inserts);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'peer';
  let code = 0;

  try {
    locker.lock(type);
    await syncPeer();
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
