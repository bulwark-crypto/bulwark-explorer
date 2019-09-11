
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../model/coin');
const { CarverAddress, CarverMovement } = require('../model/carver2d');
const { BlockRewardDetails } = require('../model/blockRewardDetails');


/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function syncCoin() {
  console.log('Syncing coin details');

  const date = moment().utc().startOf('minute').toDate();
  // Setup the coinmarketcap.com api url.
  const url = `${config.coinMarketCap.api}${config.coinMarketCap.ticker}`;

  //@todo wrap rpc in try catch and if add new "RPC Status"
  //If rpc fails, display indicator on website that RPC is down
  const info = await rpc.call('getinfo');
  const masternodes = await rpc.call('getmasternodecount');
  const nethashps = await rpc.call('getnetworkhashps');

  let market = await fetch(url);
  if (Array.isArray(market)) {
    market = market.length ? market[0] : {};
  }

  const countCarverAddresses = await CarverAddress.count();
  const countCarverMovements = await CarverMovement.count();


  const coin = new Coin({
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
    supply: market.available_supply, // TODO: change to actual count from db.
    usd: market.price_usd,
    countCarverAddresses,
    countCarverMovements
  });

  console.log('Syncing advanced analytics...');

  const date24hAgo = moment().subtract(24, 'hours').toDate();

  // Unique Stakers in last 24 hours
  {
    const aggregationResults = await BlockRewardDetails.aggregate([
      { $match: { 'date': { $gte: date24hAgo } } },
      { $group: { _id: '$stake.addressLabel' } },
      { $count: 'count' }
    ]);
    coin.uniquePosAddresses24h = aggregationResults[0].count;
  }

  // Unique masternode addresses in last 24 hours
  {
    const aggregationResults = await BlockRewardDetails.aggregate([
      { $match: { 'date': { $gte: date24hAgo } } },
      { $group: { _id: '$masternode.addressLabel' } },
      { $count: 'count' }
    ]);
    coin.uniqueMasternodeAddresses24h = aggregationResults[0].count;
  }

  // POS ROI% average over past 24 hours
  {
    const aggregationResults = await BlockRewardDetails.aggregate([
      { $match: { 'date': { $gte: date24hAgo } } },
      { $group: { _id: null, count: { $avg: '$stake.roi' } } },
    ]);
    coin.posRoi24h = aggregationResults[0].count;
  }

  await coin.save();

  //@todo add queries from below (These are raw analytics dumps)

  //db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':true,'stake.input.value':{$gte:100,$lte:110},'blockHeight':{$gte:587209}}},{$group:{_id:null,total:{$avg:'$stake.roi'}}}])

  //db.blockRewardDetails.aggregate([{ $match: { 'stake.input.isRestake': true, 'stake.input.value': { $gte: 2000 }, 'blockHeight': { $gte: 587209 } } }, { $group: { _id: null, total: { $max: '$stake.roi' } } }]);

  //db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':true,'stake.input.value':{$gte:100,$lte:110},'blockHeight':{$gte:587209}}},{$count:'stakers'}])

  /*

  // @todo add these as stats part of coin
 
  > db.blockRewardDetails.aggregate([{$match:{'stake.roi':{$gte:100}}},{$group:{_id:null,total:{$sum:'$stake.roi'}}}])  
  
  > db.blockRewardDetails.aggregate([{$match:{'stake.roi':{$gte:100}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])

  > db.blockRewardDetails.aggregate([{$match:{'stake.roi':{$gte:30}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])

  > db.blockRewardDetails.aggregate([{$match:{'stake.roi':{$lte:30}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])
 
  > db.blockRewardDetails.aggregate([{$match:{'stake.roi':{$gte:1000}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])
 
  > db.blockRewardDetails.aggregate([{$match:{'stake.isRestake':1,'stake.roi':{$gte:1000}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])
  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':1,'stake.roi':{$gte:100}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])
  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':true,'stake.roi':{$gte:100}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])
 
  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':true,'stake.roi':{$gte:1000}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])
 
  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':true,'stake.roi':{$gte:1000}}},{$group:{_id:null,total:{$max:'$stake.roi'}}}])
 
  > db.carverAddresses.find({carverAddressType:6}).count()
 
  > db.carverAddresses.find({carverAddressType:7}).count()
  > db.blockRewardDetails.aggregate([{$match:{'blockHeight':{$gte:527209}}},{$group:{_id:null,total:{$max:'$stake.roi'}}}])

  > db.blockRewardDetails.aggregate([{$match:{'blockHeight':{$gte:527209}}},{$group:{_id:null,total:{$avg:'$stake.roi'}}}])

  > db.blockRewardDetails.aggregate([{$match:{'blockHeight':{$gte:587209}}},{$group:{_id:null,total:{$avg:'$stake.roi'}}}])

  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':true,'blockHeight':{$gte:587209}}},{$group:{_id:null,total:{$avg:'$stake.roi'}}}])

  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':false,'blockHeight':{$gte:587209}}},{$group:{_id:null,total:{$avg:'$stake.roi'}}}])

  > db.blockRewardDetails.find({'stake.input.isRestake':false,'blockHeight':{$gte:587209}}).count()

  > db.blockRewardDetails.find({'stake.input.isRestake':true,'blockHeight':{$gte:587209}}).count()

  > db.blockRewardDetails.aggregate([{$match:{'stake.input.isRestake':false,'stake.roi':{$gte:500},'blockHeight':{$gte:587209}}},{$group:{_id:null,total:{$sum:'$stake.reward'}}}])

  avg stake input:
  > db.blockRewardDetails.aggregate([{$match:{'blockHeight':{$gte:587209}}},{$group:{_id:null,total:{$avg:'$stake.input.value'}}}])
  */

  console.log('Syncing complete');
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'coin';
  let code = 0;

  try {
    locker.lock(type);
    await syncCoin();
  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
