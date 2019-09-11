
const chain = require('../../lib/blockchain');
const { forEach } = require('p-iteration');
const moment = require('moment');
const { rpc } = require('../../lib/cron');
const cache = require('../lib/cache');


// System models for query and etc.
const Block = require('../../model/block');

const { CarverAddressType, CarverMovementType } = require('../../lib/carver2d');
const { CarverAddress, CarverMovement, CarverAddressMovement } = require('../../model/carver2d');
const Coin = require('../../model/coin');
const Masternode = require('../../model/masternode');
const Peer = require('../../model/peer');
const Rich = require('../../model/rich');
const { BlockRewardDetails } = require('../../model/blockRewardDetails');
const TX = require('../../model/tx');
const config = require('../../config')

/**
 * Get transactions and unspent transactions by address.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAddress = async (req, res) => {
  try {
    const carverAddress = await CarverAddress.findOne({ label: req.params.hash }).populate("lastMovement", { date: 1 });
    if (!carverAddress) {
      throw 'Address Not Found';
    }
    const carverRewardAddresses = await CarverAddress.find({ label: { $in: [`${req.params.hash}:POW`, `${req.params.hash}:POS`, `${req.params.hash}:MN`] } }).populate("lastMovement", { date: 1 });


    const masternodeForAddress = await Masternode.findOne({ addr: req.params.hash });
    const isMasternode = !!masternodeForAddress;

    res.json({
      ...carverAddress.toObject(),
      isMasternode,
      carverRewardAddresses
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Will return the average block time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgBlockTime = () => {
  //@todo move this logic to block sync (so it updates in real time and only when the block syncs)

  // When does the cache expire.
  // For now this is hard coded.
  let cache = 90.0;
  let cutOff = moment().utc().add(60, 'seconds').unix();
  let loading = true;

  // Generate the average.
  const getAvg = async () => {
    loading = true;

    try {
      const date = moment.utc().subtract(24, 'hours').toDate();
      const blocksCount = await Block.count({ createdAt: { $gt: date } });
      const seconds = 24 * 60 * 60;

      cache = seconds / blocksCount;
      cutOff = moment().utc().add(60, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      if (!cache) {
        cache = 0.0;
      }

      loading = false;
    }
  };

  // Load the initial cache.
  getAvg();

  return async (req, res) => {
    res.json(cache || 0.0);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getAvg();
    }
  };
};

/**
 * Will return the average masternode payout time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgMNTime = () => {
  //@todo move this logic to masternode sync (so it updates in real time and only when the masternode syncs)

  // When does the cache expire.
  // For now this is hard coded.
  let cache = 24.0;
  let cutOff = moment().utc().add(5, 'minutes').unix();
  let loading = true;

  /**
   * Get average payout for running a masternode (in seconds)
   * 
   * Current implementation: 
   * Because each block gives exactly 1 masternode reward we can calculate how many blocks we've created in past 24 hours
   */
  const getAvg = async () => {
    loading = true;

    try {
      const date = moment.utc().subtract(24, 'hours').toDate();
      const blocksCount = await Block.count({ createdAt: { $gt: date } });
      const masternodesCount = await Masternode.count();

      cache = (24.0 / (blocksCount / masternodesCount));
      cutOff = moment().utc().add(5, 'minutes').unix();
    } catch (err) {
      console.log(err);
    } finally {
      if (!cache) {
        cache = 0.0;
      }

      loading = false;
    }
  };

  // Load the initial cache.
  getAvg();

  return async (req, res) => {
    res.json(cache || 0.0);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getAvg();
    }
  };
};

/**
 * Get block by hash or height.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getBlock = async (req, res) => {
  try {
    const query = isNaN(req.params.hash)
      ? { hash: req.params.hash }
      : { height: req.params.hash };
    const block = await Block.findOne(query);
    if (!block) {
      res.status(404).send('Unable to find the block!');
      return;
    }

    const txs = await CarverAddress.find({
      $and: [{ blockHeight: block.height }, { carverAddressType: CarverAddressType.Tx }]
    }, { countIn: 1, countOut: 1, label: 1, valueOut: 1 });

    res.json({
      ...block.toObject(),
      txs: txs.map(tx => tx.toObject()),
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return the coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoin = (req, res) => {
  Coin.findOne()
    .sort({ createdAt: -1 })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get history of coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinHistory = (req, res) => {
  Coin.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 12) // 12x5=60 mins
    .sort({ createdAt: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return all the coins for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getCoins = async () => {
    loading = true;

    try {
      const start = moment().utc().subtract(8, 'days').toDate();
      const end = moment().utc().toDate();
      const qry = [
        // Select last 7 days of coins.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { createdAt: 1 } }
      ];

      cache = await Coin.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getCoins();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getCoins();
    }
  };
};

/**
 * Will return true if a block hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getIsBlock = async (req, res) => {
  try {
    let isBlock = false;

    // Search for block hash.
    const block = await Block.findOne({ hash: req.params.hash });
    if (block) {
      isBlock = true;
    }

    res.json(isBlock);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodes = async (req, res) => {
  try {
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit, 10) : 100, 1000);
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

    var query = {};

    // Optionally it's possible to filter masternodes running on a specific address
    if (req.query.hash) {
      query.addr = req.query.hash;
    }

    // Optionally it's possible to filter masternodes running on a specific range of addresses. Pass in addresses as comma-seprated list
    // In redux we pass in an array and it automatically converts into a comma-seperated list of addresses
    if (req.query.addresses) {
      const addressList = req.query.addresses.split(',');
      // At the moment the limit of addresses in a single query is 25 but this number will be increased later, perhaps with some form of caching
      if (addressList.length < 25) {
        query.addr = { "$in": addressList };
      }
    }

    const total = await Masternode.count(query);
    const mns = await Masternode
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ lastPaidAt: -1, status: 1 })
      .populate('carverAddress')
      .populate({ path: 'carverAddressMn', populate: { path: 'lastMovement' } });

    res.json({ mns, pages: total <= limit ? 1 : Math.ceil(total / limit), total });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get a masternode by wallet adress hash from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeByAddress = async (req, res) => {
  try {
    const hash = req.params.hash;
    const mns = await Masternode.findOne({ addr: hash });

    res.json({ mns });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeCount = async (req, res) => {
  try {
    const masternodeCount = await cache.getFromCache("masternodeCount", moment().utc().add(60, 'seconds').unix(), async () => {
      const coin = await Coin.findOne().sort({ createdAt: -1 });
      return { enabled: coin.mnsOn, total: coin.mnsOff + coin.mnsOn };
    });

    res.json(masternodeCount);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the list of peers from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPeer = (req, res) => {
  Peer.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 500)
    .sort({ ip: 1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get coin supply information for usage.
 * https://github.com/coincheckup/crypto-supplies
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getSupply = async (req, res) => {
  try {
    let c = 0; // Circulating supply. @todo
    let t = 0; // Total supply.

    const totalSupply = await cache.getFromCache("supply", moment().utc().add(1, 'hours').unix(), async () => {
      const balanceAgregation = await CarverAddress.aggregate([{ $match: { carverAddressType: 1 } }, { $group: { _id: null, total: { $sum: '$balance' } } }]);
      return balanceAgregation[0].total;
    });

    const supply = { c: totalSupply, t: totalSupply }

    res.json(supply);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Get the top 100 addresses from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTop100 = async (req, res) => {
  try {
    const docs = await cache.getFromCache("top100", moment().utc().add(1, 'hours').unix(), async () => {
      return await CarverAddress.find({ carverAddressType: CarverAddressType.Address }, { sequence: 0 })
        .limit(100)
        .sort({ balance: -1 }).populate("lastMovement", { date: 1 });
    });

    res.json(docs);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXLatest = async (req, res) => {
  try {
    const latestMovements = await CarverMovement.find({ isReward: 0 }).sort({ sequence: -1 }).limit(10);

    res.json(latestMovements);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return the transaction information for given hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTX = async (req, res) => {
  try {
    const hash = req.params.hash;

    const carverMovement = await CarverMovement.findOne({ txId: hash }, { sequence: 0 });
    if (!carverMovement) {
      res.status(404).send('Unable to find the transaction!');
      return;
    }
    const carverAddressMovements = await CarverAddressMovement.find({ carverMovement: carverMovement._id }, { sequence: 0 }).populate('carverAddress', { carverAddressType: 1, label: 1, carverMovement: 1 });


    //.populate('to', { label: 1, carverAddressType: 1 })
    //.populate('from', { label: 1, carverAddressType: 1 })
    //.sort({ sequence: -1 })
    //.hint({ contextTx: 1, sequence: 1 }); // Index hinting


    res.json({
      ...carverMovement.toObject(),
      carverAddressMovements
      //carverAddress: carverAddress.toObject(),
      //movements: carverMovements.map(carverMovement => carverMovement.toObject())
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXs = async (req, res) => {
  try {
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit, 10) : 10, 100);
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const sort = 'sequence';//req.query.sort === 'sequence' ? 'sequence' : 'valueOut';

    let query = { isReward: false /*carverAddressType: CarverAddressType.Tx*/ };

    // Optional date range
    if (req.query.date) {
      /*const ticksDifference = Number.parseInt(req.query.date);
      if (ticksDifference) {
        const minDate = moment().subtract(ticksDifference, 'seconds').toDate();
        query.date = { $gte: minDate }
      }*/
    }

    const total = await CarverMovement.find(query).count();
    const txs = await CarverMovement.find(query).skip(skip).limit(limit).sort({ [sort]: -1 });

    let carverMovementIdsToFetch = [];
    txs.forEach(tx => {
      const totalAddresses = tx.addressesIn + tx.addressesOut;

      if (totalAddresses <= config.maxMovementsAddressesToFetch) {
        carverMovementIdsToFetch.push(tx._id);
      }
    });

    //@todo new movements layout can have more details
    //const carverAddressMovements = await CarverAddressMovement.find({ carverMovement: { $in: carverMovementIdsToFetch } }).populate('carverAddress', { carverAddressType: 1, label: 1, carverMovement: 1 });

    const txsWithMovements = txs.map(tx => {
      //const txCarverAddressMovements = carverAddressMovements.filter(carverAddressMovement => carverAddressMovement.carverMovement.toString() === tx._id.toString()); // Find all matching movements for this tx. Notice .toString() because we're comparing mongoose.Schema.Types.ObjectId

      return {
        ...tx.toObject(),
        //from: txCarverAddressMovements.filter(txCarverAddressMovement => txCarverAddressMovement.amount < 0),
        //to: txCarverAddressMovements.filter(txCarverAddressMovement => txCarverAddressMovement.amount >= 0)
      }
    });

    res.json({ txs: txsWithMovements, pages: total <= limit ? 1 : Math.ceil(total / limit), total });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};
/**
 * Return pos roi% calculations
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPos = async (req, res) => {
  try {
    //fromInputAmount=1500&toInputAmount=3000&date=2678400&restakeOnly=1
    const fromInputAmount = Math.max(Math.min(req.query.fromInputAmount ? parseInt(req.query.fromInputAmount, 10) : 10, 1000000), 100);
    const toInputAmount = Math.max(Math.min(req.query.toInputAmount ? parseInt(req.query.toInputAmount, 10) : 10, 1000000), 100);

    if (fromInputAmount > toInputAmount) {
      res.status(404).send('Input Size (From) must be <= Input Size (To)');
      return;
    }

    const ticksDifference = Math.min(Number.parseInt(req.query.date), 60 * 60 * 24 * 365); // Limit to max of 1 year
    const minDate = moment().subtract(ticksDifference, 'seconds').toDate();
    const isRestake = req.query.restakeOnly === '1';

    let query = {
      'stake.input.value': { $gte: fromInputAmount, $lte: toInputAmount },
      'date': { $gte: minDate }
    };
    if (isRestake) {
      query['stake.input.isRestake'] = true;
    }

    const posAggregationResults = await BlockRewardDetails.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: 'stakeRoiPercent',
          avg: { $avg: '$stake.roi' },
          min: { $min: '$stake.roi' },
          max: { $max: '$stake.roi' }
        }
      }])

    if (!posAggregationResults || posAggregationResults.length === 0) {
      res.status(404).send('No rewards matching criteria!');
      return;
    }

    const count = await BlockRewardDetails.find(query).count();

    const roi = posAggregationResults.find(group => group._id === 'stakeRoiPercent')

    const results = {
      fromInputAmount,
      toInputAmount,
      minDate,
      roi,
      count,
      isRestake
    }


    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return a paginated list of rewards.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getRewards = async (req, res) => {
  try {
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit, 10) : 10, 100);
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

    const query = {};

    const total = await BlockRewardDetails.count(query);
    const rewards = await BlockRewardDetails.find(query).skip(skip).limit(limit).sort({ blockHeight: -1 });
    //.sort({ 'stake.roi': -1 }); //@todo add optional sort


    res.json({ rewards, pages: total <= limit ? 1 : Math.ceil(total / limit), total });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};


/**
 * Return a paginated list of Carver2D Movements.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMovements = async (req, res) => {
  try {
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit, 10) : 10, 100);
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const addressId = req.query.addressId || null;

    let query = {};
    if (addressId) {
      query = { carverAddress: addressId };
    }

    const total = await CarverAddressMovement.count(query);
    const movements = await CarverAddressMovement
      .find(query, { sequence: 0 })
      .skip(skip)
      .limit(limit)
      .sort({ sequence: -1 })
      .populate('carverMovement', { sequence: 0 });

    res.json({ movements, pages: total <= limit ? 1 : Math.ceil(total / limit), total });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return all the transactions for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXsWeek = () => {
  // When does the cache expire.
  // For now this is hard coded.
  let cache = [];
  let cutOff = moment().utc().add(1, 'hour').unix();
  let loading = true;

  // Aggregate the data and build the date list.
  const getTXs = async () => {
    loading = true;

    try {
      const start = moment().utc().startOf('day').subtract(7, 'days').toDate();
      const end = moment().utc().endOf('day').subtract(1, 'days').toDate();
      const qry = [
        // Select last 7 days of txs.
        { $match: { createdAt: { $gt: start, $lt: end } } },
        // Convert createdAt date field to date string.
        { $project: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
        // Group by date string and build total/sum.
        { $group: { _id: '$date', total: { $sum: 1 } } },
        // Sort by _id/date field in ascending order (order -> newer)
        { $sort: { _id: 1 } }
      ];

      cache = await TX.aggregate(qry);
      cutOff = moment().utc().add(90, 'seconds').unix();
    } catch (err) {
      console.log(err);
    } finally {
      loading = false;
    }
  };

  // Load the initial cache.
  getTXs();

  return async (req, res) => {
    res.json(cache);

    // If the cache has expired then go ahead
    // and get a new one but return the current
    // cache for this request.
    if (!loading && cutOff <= moment().utc().unix()) {
      await getTXs();
    }
  };
};

module.exports = {
  getAddress,
  getAvgBlockTime,
  getAvgMNTime,
  getBlock,
  getCoin,
  getCoinHistory,
  getCoinsWeek,
  getIsBlock,
  getMasternodes,
  getMasternodeByAddress,
  getMasternodeCount,
  getPeer,
  getSupply,
  getTop100,
  getTXLatest,
  getTX,
  getTXs,
  getPos,
  getRewards,
  getTXsWeek,
  getMovements
};
