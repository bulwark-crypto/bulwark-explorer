
const express = require('express');
const blockex = require('../handler/blockex');
const iquidus = require('../handler/iquidus');

const router = express.Router();

router.get('/address/:hash', blockex.getAddress);
router.get('/block/:hash', blockex.getBlock);
router.get('/coin', blockex.getCoin);
router.get('/coin/history', blockex.getCoinHistory);
router.get('/coin/week', blockex.getCoinsWeek());
router.get('/masternode', blockex.getMasternodes);
router.get('/masternodecount', blockex.getMasternodeCount);
router.get('/peer', blockex.getPeer);
router.get('/supply', blockex.getSupply);
router.get('/top100', blockex.getTop100);
router.get('/tx', blockex.getTXs);
router.get('/tx/latest', blockex.getTXLatest);
router.get('/tx/week', blockex.getTXsWeek());
router.get('/tx/:hash', blockex.getTX);

// Iquidus Explorer routes.
router.get('/getdifficulty', iquidus.getdifficulty);
router.get('/getconnectioncount', iquidus.getconnectioncount);
router.get('/getblockcount', iquidus.getblockcount);
router.get('/getblockhash', iquidus.getblockhash);
router.get('/getblock', iquidus.getblock);
router.get('/getrawtransaction', iquidus.getrawtransaction);
router.get('/getnetworkhashps', iquidus.getnetworkhashps);

module.exports =  router;
