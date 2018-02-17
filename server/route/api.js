
import config from '../../config';
import express from 'express';
import rpc from 'node-bitcoin-rpc';

const router = express.Router();

rpc.init(
    config.rpc.host, 
    config.rpc.port, 
    config.rpc.user, 
    config.rpc.pass
);

const callNode = (res, fn = 'getinfo', params = [], timeout = 500) => {
    rpc.setTimeout(timeout);

    rpc.call(fn, params, (err, data) => {
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

// masternodelist
router.get('/masternodelist', (req, res) => {
    callNode(res, 'masternode', ['list']);
});

export default router;