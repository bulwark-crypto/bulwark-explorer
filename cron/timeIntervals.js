
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
const { TimeIntervalType, TimeIntervalColumn } = require('../lib/timeInterval');

const syncTimeIntervalSettings = async (timeIntervalSettings) => {

  // Fetch the most recent interval number from last sync for type/query
  const getLastSyncedIntervalNumber = async () => {
    const firstTimeIntervalForType = await TimeInterval.findOne({ type: timeIntervalSettings.type }).sort({ intervalNumber: -1 });
    if (firstTimeIntervalForType) {
      return firstTimeIntervalForType.intervalNumber;
    }

    return 0;
  }
  const lastSyncedIntervalNumber = await getLastSyncedIntervalNumber();

  // Get the required aggregation columns for use in aggregation pipeline
  const getMinIntervalMatchAggregation = (intervalNumber) => {
    switch (timeIntervalSettings.timeIntervalColumn) {
      case TimeIntervalColumn.Date:
        return {
          $match: {
            date: { $gt: moment.unix(intervalNumber).utc().toDate() }
          }
        };
    }
    return null;
  }
  const minIntervalNumberAggregation = lastSyncedIntervalNumber > 0 ? [getMinIntervalMatchAggregation(lastSyncedIntervalNumber)] : [];
  console.log(minIntervalNumberAggregation, minIntervalNumberAggregation);

  const getMaxIntervalNumber = () => {
    switch (timeIntervalSettings.timeIntervalColumn) {
      case TimeIntervalColumn.Date:
        return moment().utc().hour(0).minutes(0).seconds(0).milliseconds(0).unix();
    }
  }
  const maxIntervalNumber = getMaxIntervalNumber();
  console.log('maxIntervalNumber:', maxIntervalNumber);

  const aggregationPipeline = [
    ...minIntervalNumberAggregation,
    ...timeIntervalSettings.aggregationPipeline,
    //@todo limit ?
  ]

  const blockRewardDetailsCursor = timeIntervalSettings.model.aggregate(aggregationPipeline).cursor().exec();
  await blockRewardDetailsCursor.eachAsync(async (item) => {
    const intervalNumber = moment(item._id, 'YYYY-MM-DD').utc().unix();

    // No addition required if it's the same date as the last inserted or possible max
    if (intervalNumber === lastSyncedIntervalNumber || intervalNumber >= maxIntervalNumber) {
      return;
    }

    const newTimeIntervalItem = new TimeInterval({
      type: timeIntervalSettings.type,
      label: item._id,
      intervalNumber,
      value: item.value
    });
    await newTimeIntervalItem.save();
  })
}

/**
 * Add new time-based intervals below.
 */
const syncTimeIntervals = async () => {
  console.log('Syncing time intervals');

  await syncTimeIntervalSettings({
    type: TimeIntervalType.DailyAvgPosRoi,
    timeIntervalColumn: TimeIntervalColumn.Date,

    model: BlockRewardDetails,
    aggregationPipeline: [
      { $match: { 'stake': { $exists: true } } }, //@todo would be really cool if we could identify if stake exists on block reward Model via a bool?
      { $project: { 'stake.roi': 1, value: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
      { $group: { _id: '$value', value: { $avg: '$stake.roi' } } },
      { $sort: { _id: 1 } },
    ]
  });

  await syncTimeIntervalSettings({
    type: TimeIntervalType.DailyNonRewardTransactionsCount,
    timeIntervalColumn: TimeIntervalColumn.Date,

    model: CarverMovement,
    aggregationPipeline: [
      { $match: { isReward: false } },
      { $project: { yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
      { $group: { _id: '$yearMonthDay', value: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]
  });

  await syncTimeIntervalSettings({
    type: TimeIntervalType.DailyAvgPosInputValue,
    timeIntervalColumn: TimeIntervalColumn.Date,

    model: BlockRewardDetails,
    aggregationPipeline: [
      { $match: { 'stake': { $exists: true } } }, //@todo would be really cool if we could identify if stake exists on block reward Model via a bool?
      { $project: { 'stake.input.value': 1, value: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
      { $group: { _id: '$value', value: { $avg: '$stake.input.value' } } },
      { $sort: { _id: 1 } },
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
