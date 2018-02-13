'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeBitcoinRpc = require('node-bitcoin-rpc');

var _nodeBitcoinRpc2 = _interopRequireDefault(_nodeBitcoinRpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express2.default.Router();

_nodeBitcoinRpc2.default.init(_config2.default.rpc.host, _config2.default.rpc.port, _config2.default.rpc.user, _config2.default.rpc.pass);

const callNode = (res, fn = 'getinfo', params = [], timeout = 500) => {
    _nodeBitcoinRpc2.default.setTimeout(timeout);

    _nodeBitcoinRpc2.default.call(fn, params, (err, data) => {
        if (res.headersSent) {
            console.log(err);
            return;
        }

        res.json(err ? err : data);
    });
};

// getinfo
router.get('/getinfo', (req, res) => {
    callNode(res, 'getinfo', null);
});

// getnetworkhashps
router.get('/getnetworkhashps', (req, res) => {
    callNode(res, 'getnetworkhashps', null);
});

// getmininginfo
router.get('/getmininginfo', (req, res) => {
    callNode(res, 'getmininginfo', null);
});

// getdifficulty
router.get('/getdifficulty', (req, res) => {
    callNode(res, 'getdifficulty', null);
});

// getconnectioncount
router.get('/getconnectioncount', (req, res) => {
    callNode(res, 'getconnectioncount', null);
});

// getblockcount
router.get('/getblockcount', (req, res) => {
    callNode(res, 'getblockcount', null);
});

// getblockhash
router.get('/getblockhash', (req, res) => {
    const idx = parseInt(req.param('index'), 10);
    callNode(res, 'getblockhash', [idx]);
});

// getblock
router.get('/getblock', (req, res) => {
    callNode(res, 'getblock', [req.param('hash')]);
});

// getrawtransaction
router.get('/getrawtransaction', (req, res) => {
    callNode(res, 'getrawtransaction', [req.param('txid')]);
});

// getpeerinfo
router.get('/getpeerinfo', (req, res) => {
    callNode(res, 'getpeerinfo', null);
});

// gettxoutsetinfo
router.get('/gettxoutsetinfo', (req, res) => {
    callNode(res, 'gettxoutsetinfo', null, 2000);
});

// getmasternodecount
router.get('/getmasternodecount', (req, res) => {
    callNode(res, 'getmasternodecount', null);
});

// getmasternodecountonline
router.get('/getmasternodecountonline', (req, res) => {
    callNode(res, 'getmasternodecountonline', null);
});

// masternodelist
router.get('/masternodelist', (req, res) => {
    callNode(res, 'masternode', ['list']);
});

exports.default = router;