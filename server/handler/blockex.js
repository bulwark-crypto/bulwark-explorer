
const { forEach } = require('p-iteration');
const moment = require('moment');
const { rpc } = require('../../lib/cron');

// System models for query and etc.
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Masternode = require('../../model/masternode');
const Peer = require('../../model/peer');
const Rich = require('../../model/rich');
const TX = require('../../model/tx');

/**
 * Get transactions by address.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAddress = async (req, res) => {
  try {
    const qry = { 'vout.address': req.params.hash };
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await TX.find(qry).sort({ blockHeight: -1 }).count();
    const txs = await TX.find(qry).skip(skip).limit(limit).sort({ blockHeight: -1 });

    res.json({
      txs,
      pages: total <= limit ? 1 : Math.ceil(total / limit)
    });
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
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

    const txs = await TX.find({ txId: { $in: block.txs }});

    res.json({ block, txs });
  } catch(err) {
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
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinsWeek = async (req, res) => {
  try {
    const date = moment().utc().subtract(7, 'days').toDate();
    const qry = { createdAt: { $gt: date } };
    const coins = await Coin.find(qry).sort({ blockHeight: -1 });

    res.json(coins);
  } catch(err) {
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
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await Masternode.find().sort({ lastPaidAt: -1, status: 1 }).count();
    const mns = await Masternode.find().skip(skip).limit(limit).sort({ lastPaidAt: -1, status: 1 });

    res.json({ mns, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch(err) {
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
    const coin = await Coin.findOne().sort({ createdAt: -1 });

    res.json({ enabled: coin.mnsOn, total: coin.mnsOff + coin.mnsOn });
  } catch(err) {
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
 * Get the top 100 addresses from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTop100 = (req, res) => {
  Rich.find()
    .sort({ value: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXLatest = (req, res) => {
  TX.find()
    .limit(10)
    .sort({ blockHeight: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Return the transaction information for given hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTX = async (req, res) => {
  try {
    const query = isNaN(req.params.hash)
      ? { txId: req.params.hash }
      : { height: req.params.hash };
    const tx = await TX.findOne(query);
    if (!tx) {
      res.status(404).send('Unable to find the transaction!');
      return;
    }

    res.json(tx);
  } catch(err) {
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
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const total = await TX.find().sort({ blockHeight: -1 }).count();
    const txs = await TX.find().skip(skip).limit(limit).sort({ blockHeight: -1 });

    res.json({ txs, pages: total <= limit ? 1 : Math.ceil(total / limit) });
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

/**
 * Return all the transactions for an entire week.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXsWeek = async (req, res) => {
  try {
    const date = moment().utc().subtract(7, 'days').toDate();
    const qry = { createdAt: { $gt: date } };
    const txs = await TX.find(qry).sort({ blockHeight: -1 });

    res.json(txs);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

module.exports =  {
  getAddress,
  getBlock,
  getCoin,
  getCoinHistory,
  getCoinsWeek,
  getMasternodes,
  getMasternodeCount,
  getPeer,
  getTop100,
  getTXLatest,
  getTX,
  getTXs,
  getTXsWeek
};
