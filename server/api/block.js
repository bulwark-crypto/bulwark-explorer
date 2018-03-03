
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
    .sort({ height: 0 })
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
  let block = {};
  Block.findOne({ hash: req.params.hash })
    .then((doc) => {
      block = doc;
      return TX.find({ hash: { $in: block.txs } });
    })
    .then((docs) => {
      block.txs = docs;
      res.json(block);
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
  let block = {};
  Block.findOne({ height: req.params.height })
    .then((doc) => {
      block = doc;
      return TX.find({ hash: { $in: block.txs } });
    })
    .then((docs) => {
      block.txs = docs;
      res.json(block);
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
    .sort({ createdAt: 0 })
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
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 50)
    .sort({ createdAt: 0 })
    .then((docs) => {
      res.json(docs);
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
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 100)
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
 * Get the historical list of peers.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPeerHistory = (req, res) => {
  Peer.find()
    .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
    .limit(req.query.limit ? parseInt(req.query.limit, 10) : 500)
    .sort({ createdAt: 0, ip: 1 })
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
    .sort({ height: 0 })
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

module.exports =  {
  getAddress,
  getBlockByHash,
  getBlockByHeight,
  getCoin,
  getCoinHistory,
  getPeer,
  getPeerHistory,
  getTXLatest,
  getTX
};
