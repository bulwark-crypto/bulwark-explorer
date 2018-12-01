
const blockex = require('./blockex');
const { rpc } = require('../../lib/cron');
// Models
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Rich = require('../../model/rich');
const UTXO = require('../../model/utxo');

// Get latest coin info helper method.
const getCoin = async () => Coin.findOne().sort({ createdAt: -1 });

const getdifficulty = async (req, res) => {
  try {
    const coin = await getCoin();
    res.json(coin.diff);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getconnectioncount = async (req, res) => {
  try {
    const coin = await getCoin();
    res.json(coin.peers);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getblockcount = async (req, res) => {
  try {
    const block = await Block.findOne({}).sort({'height': -1});
    res.json(block.height);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getblockhash = async (req, res) => {
  try {
    if (!req.query.index || isNaN(req.query.index)) {
      throw new Error('Block height must be a number!');
    }

    const block = await Block.findOne({ height: req.query.index });
    res.json(block.hash);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getblock = async (req, res) => {
  try {
    if (!req.query.hash || !isNaN(req.query.hash)) {
      throw new Error('Block hash must be a string!');
    }

    const block = await Block.findOne({ height: req.query.index });
    res.json(block);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getrawtransaction = async (req, res) => {
  try {
    if (!req.query.txid || !isNaN(req.query.txid)) {
      throw new Error('Transaction hash must be a string!');
    }

    const raw = await rpc.call('getrawtransaction', [req.query.txid]);
    if (!req.query.decrypt) {
      res.json(raw);
      return;
    }

    const tx = await rpc.call('decoderawtransaction', [raw]);
    res.send(tx);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getnetworkhashps = async (req, res) => {
  try {
    const coin = await getCoin();
    res.json(coin.netHash);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getmoneysupply = async (req, res) => {
  try {
    const results = await UTXO.aggregate([
      { $group: { _id: 'supply', total: { $sum: '$value' } } }
    ]);
    res.json(results.length ? results[0].total : 0);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getdistribution = async (req, res) => {
  try {
    res.json([]); // TODO: update route.
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getaddress = blockex.getAddress;

const getbalance = async (req, res) => {
  try {
    const utxo = await UTXO.find({ address: req.params.hash });
    let bal = 0.0;
    utxo.forEach(tx => bal += tx.value);
    res.json(bal);
  } catch(err) {
    console.log(err);
    res.status(500).send(err.message || err);
  }
};

const getlasttxs = blockex.getTXLatest;

module.exports =  {
  // /api
  getdifficulty,
  getconnectioncount,
  getblockcount,
  getblockhash,
  getblock,
  getrawtransaction,
  getnetworkhashps,
  // /ext
  getmoneysupply,
  getdistribution,
  getaddress,
  getbalance,
  getlasttxs
};
