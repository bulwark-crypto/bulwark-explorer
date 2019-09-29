
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
const { TimeInterval } = require('../model/timeInterval');
const { BlockRewardDetails } = require('../model/blockRewardDetails');
const { TimeIntervalType } = require('../lib/timeInterval');


/**
 * 
 */
const syncTimeIntervals = async () => {
  console.log('Syncing time intervals');

  const getTopAggregationItem = async (model, aggregationPipeline) => {
    return await model.aggregate([
      ...aggregationPipeline,
      { $limit: 1 }
    ]);
  }

  const syncTimeIntervalSettings = async (timeIntervalSettings) => {

    //@todo resuming
    const firstTimeIntervalForType = await TimeInterval.findOne({ type: timeIntervalSettings.type }).sort({ intervalNumber: -1 });
    if (firstTimeIntervalForType) {
      const topItem = await getTopAggregationItem(timeIntervalSettings.model, timeIntervalSettings.aggregationPipeline);
      //if (topItem._id === firstTimeIntervalForType.)
    }


    const aggregationPipeline = [
      ...timeIntervalSettings.aggregationPipeline,
      //@todo limit
    ]

    var blockRewardDetailsCursor = timeIntervalSettings.model.aggregate(aggregationPipeline).cursor().exec();

    /*
    await blockRewardDetailsCursor.eachAsync(async (item) => {
      const intervalNumber = moment(item._id, 'YYYY-MM-DD').utc().unix();

      const newTimeIntervalItem = new TimeInterval({
        type: timeIntervalSettings.type,
        label: item._id,
        intervalNumber,
        value: item.value
      });
      await newTimeIntervalItem.save();
    })
  }
  */


    await syncTimeIntervalSettings({
      type: TimeIntervalType.DailyAvgPosRoi,

      model: BlockRewardDetails,
      aggregationPipeline: [
        { $match: { 'stake': { $exists: true } } }, //@todo would be really cool if we could identify if stake exists on block reward Model via a bool?
        { $project: { 'stake.roi': 1, value: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
        { $group: { _id: '$value', value: { $avg: '$stake.roi' } } },
        { $sort: { _id: -1 } },
      ]
    });


    await syncTimeIntervalSettings({
      type: TimeIntervalType.DailyNonRewardTransactionsCount,

      model: CarverMovement,
      aggregationPipeline: [
        { $match: { isReward: false } },
        { $project: { yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
        { $group: { _id: '$yearMonthDay', value: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]
    });

    await syncTimeIntervalSettings({
      type: TimeIntervalType.DailyAvgPosInputValue,

      model: BlockRewardDetails,
      aggregationPipeline: [
        { $match: { 'stake': { $exists: true } } }, //@todo would be really cool if we could identify if stake exists on block reward Model via a bool?
        { $project: { 'stake.input.value': 1, value: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
        { $group: { _id: '$value', value: { $avg: '$stake.input.value' } } },
        { $sort: { _id: -1 } },
      ]
    });

    //@todo abg stake.ageTime

    //@todo avg tx input (non-reward)
    //db.carverMovements.aggregate([ {$match:{isReward:false}}, {$project:{amountIn:1,yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }}, {$group:{_id:'$yearMonthDay',value:{$avg:'$amountIn'}}} ,{$sort:{_id:-1}}])



    console.log('Syncing complete');
  }


  /**
   * Handle locking.
   */
  async function update() {
    const type = 'timeIntervals';
    let code = 0;

    try {
      locker.lock(type);
      await syncTimeIntervals();
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
