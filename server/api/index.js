
import express from 'express';
// Handlers.
import block from './blockchain';

// Setup subrouter for /api routes.
const router = express.Router();

// Connect the routes with the handlers.
router.get('/tx/latest', block.getTXLatest);

export default router;