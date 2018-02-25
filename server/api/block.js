
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Peer = require('../../model/peer');
const TX = require('../../model/tx');

/**
 * Get transactions by address.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAddress = (req, res) => {
  TX.find({ addrs: req.params.hash })
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 10)
    .sort({ height: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get block by hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getBlockByHash = (req, res) => {
  Block.findOne({ hash: req.params.hash })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

/**
 * Get block by height.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getBlockByHeight = (req, res) => {
  Block.findOne({ height: req.params.height })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
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
 * Get the list of peers from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPeer = (req, res) => {
  Peer.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 50)
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
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXLatest = (req, res) => {
  TX.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 50)
    .sort({ height: -1 })
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
const getTX = (req, res) => {
  TX.findOne({ hash: req.params.hash })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message || err);
    });
};

export default {
  getAddress,
  getBlockByHash,
  getBlockByHeight,
  getCoin,
  getPeer,
  getTXLatest,
  getTX
};
