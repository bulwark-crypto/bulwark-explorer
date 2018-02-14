'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeBitcoinRpc = require('node-bitcoin-rpc');

var _nodeBitcoinRpc2 = _interopRequireDefault(_nodeBitcoinRpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

_nodeBitcoinRpc2.default.init(_config2.default.rpc.host, _config2.default.rpc.port, _config2.default.rpc.user, _config2.default.rpc.pass);

var callNode = function callNode(res) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'getinfo';
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 500;

    _nodeBitcoinRpc2.default.setTimeout(timeout);

    _nodeBitcoinRpc2.default.call(fn, params, function (err, data) {
        if (res.headersSent) {
            console.log(err);
            return;
        }

        res.json(err ? err : data);
    });
};

// getinfo
router.get('/getinfo', function (req, res) {
    callNode(res, 'getinfo', null);
});

// getnetworkhashps
router.get('/getnetworkhashps', function (req, res) {
    callNode(res, 'getnetworkhashps', null);
});

// getmininginfo
router.get('/getmininginfo', function (req, res) {
    callNode(res, 'getmininginfo', null);
});

// getdifficulty
router.get('/getdifficulty', function (req, res) {
    callNode(res, 'getdifficulty', null);
});

// getconnectioncount
router.get('/getconnectioncount', function (req, res) {
    callNode(res, 'getconnectioncount', null);
});

// getblockcount
router.get('/getblockcount', function (req, res) {
    callNode(res, 'getblockcount', null);
});

// getblockhash
router.get('/getblockhash', function (req, res) {
    var idx = parseInt(req.param('index'), 10);
    callNode(res, 'getblockhash', [idx]);
});

// getblock
router.get('/getblock', function (req, res) {
    callNode(res, 'getblock', [req.param('hash')]);
});

// getrawtransaction
router.get('/getrawtransaction', function (req, res) {
    callNode(res, 'getrawtransaction', [req.param('txid')]);
});

// getpeerinfo
router.get('/getpeerinfo', function (req, res) {
    callNode(res, 'getpeerinfo', null);
});

// gettxoutsetinfo
router.get('/gettxoutsetinfo', function (req, res) {
    callNode(res, 'gettxoutsetinfo', null, 2000);
});

// getmasternodecount
router.get('/getmasternodecount', function (req, res) {
    callNode(res, 'getmasternodecount', null);
});

// masternodelist
router.get('/masternodelist', function (req, res) {
    callNode(res, 'masternode', ['list']);
});

exports.default = router;