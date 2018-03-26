
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

  await Peer.remove({});

  const peers = await rpc.call('getpeerinfo');
  const inserts = [];
  await forEach(peers, async (peer) => {
    const parts = peer.addr.split(':');

    const url = `${ config.freegeoip.api }${ parts[0] }`;
    let geoip = {};
    if (/^\d\.\d\.\d\.\d$/.test(parts[0])) {
      await fetch(url);
    }

    const p = new Peer({
      _id: geoip.ip ? geoip.ip : url,
      country: geoip.country_name,
      countryCode: geoip.country_code,
      createdAt: date,
      ip: geoip.ip ? geoip.ip : url,
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
    locker.unlock(type);
    exit(code);
  }
}

update();
