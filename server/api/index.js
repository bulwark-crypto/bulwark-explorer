
import express from 'express';
// Handlers.
import block from './block';

// Setup subrouter for /api routes.
const router = express.Router();

// Connect the routes with the handlers.
router.get('/address/:hash', block.getAddress);
router.get('/block/hash/:hash', block.getBlockByHash);
router.get('/block/height/:height', block.getBlockByHeight);
router.get('/coin', block.getCoin);
router.get('/peer', block.getPeer);
router.get('/tx/latest', block.getTXLatest);
router.get('/tx/:hash', block.getTX);

export default router;
