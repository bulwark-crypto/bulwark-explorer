
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../model/coin');
const { CarverAddress, CarverMovement } = require('../model/carver2d');
const { CarverAddressType } = require('../lib/carver2d');
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

  const countCarverAddresses = await CarverAddress.find({ carverAddressType: CarverAddressType.Address }).count();
  const countCarverMovements = await CarverMovement.find({ isReward: false }).count();


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
    coin.uniquePosAddresses24h = aggregationResults.length > 0 ? aggregationResults[0].count : 0;
  }

  // Unique masternode addresses in last 24 hours
  {
    const aggregationResults = await BlockRewardDetails.aggregate([
      { $match: { 'date': { $gte: date24hAgo } } },
      { $group: { _id: '$masternode.addressLabel' } },
      { $count: 'count' }
    ]);
    coin.uniqueMasternodeAddresses24h = aggregationResults.length > 0 ? aggregationResults[0].count : 0;
  }

  // POS ROI% average over past 24 hours
  {
    const aggregationResults = await BlockRewardDetails.aggregate([
      { $match: { 'date': { $gte: date24hAgo } } },
      { $group: { _id: null, count: { $avg: '$stake.roi' } } },
    ]);
    coin.posRoi24h = aggregationResults.length > 0 ? aggregationResults[0].count : 0;

    // MN ROI% average over past 24 hours
    {
      const aggregationResults = await BlockRewardDetails.aggregate([
        { $match: { 'date': { $gte: date24hAgo } } },
        { $group: { _id: null, avgAge: { $avg: '$masternode.ageTime' }, avgRewards: { $avg: '$masternode.reward' } } }
      ]);
      if (aggregationResults.length > 0) {

        // Calculate ROI% for masternode
        const mnRewardsPerYear = (365 * 24 * 60 * 60) / (aggregationResults[0].avgAge / 1000);
        const mnRoi = ((mnRewardsPerYear * aggregationResults[0].avgRewards) / config.coinDetails.masternodeCollateral) * 100;

        coin.mnRoi24h = mnRoi;
      } else {
        coin.mnRoi24h = aggregationResults.length > 0 ? aggregationResults[0].count : 0;
      }
    }
  }

  await coin.save();

  //@todo add queries from below (These are raw analytics dumps)

  // daily avg roi2: db.blockRewardDetails.aggregate([ {$project:{'stake.roi':-1,yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }}, {$group:{_id:'$yearMonthDay',roiAverage:{$avg:'$stake.roi'}}} ,{$sort:{_id:1}}])

  // daily avg roi: db.blockRewardDetails.aggregate([ {$sort:{date:1}}, {$project:{'stake.roi':1,yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }}, {$group:{_id:'$yearMonthDay',roiAverage:{$avg:'$stake.roi'}}}])

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

  //db.carverMovements.aggregate([ {$match:{isReward:false}},{$sort:{sequence:1}}, {$project:{addressesIn:1,amountIn:1,yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }}, {$group:{_id:'$yearMonthDay',total:{$sum:'$amountIn'}}}])

  // Daily POS Rewards
  // db.blockRewardDetails.aggregate([ {$project:{'stake.reward':-1,yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }}, {$group:{_id:'$yearMonthDay',roiAverage:{$sum:'$stake.reward'}}} ,{$sort:{_id:-1}}])
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
