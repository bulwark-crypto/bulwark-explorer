
const express = require('express');
const iquidus = require('../handler/iquidus');

const router = express.Router();

// Iquidus Explorer routes.
router.get('/getmoneysupply', iquidus.getmoneysupply);
router.get('/getdistribution', iquidus.getdistribution);
router.get('/getaddress', iquidus.getaddress);
router.get('/getbalance', iquidus.getbalance);
router.get('/getlasttxs', iquidus.getlasttxs);

module.exports =  router;
