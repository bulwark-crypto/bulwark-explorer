const chain = require('../../lib/blockchain');
const { forEach } = require('p-iteration');
const moment = require('moment');
const { rpc } = require('../../lib/cron');
const cache = require('../lib/cache');


// System models for query and etc.
const Block = require('../../model/block');
const Coin = require('../../model/coin');
const Masternode = require('../../model/masternode');
const Peer = require('../../model/peer');
const Rich = require('../../model/rich');
const BlockRewardDetails = require('../../model/blockRewardDetails');
const TX = require('../../model/tx');
const UTXO = require('../../model/utxo');

/**
 * Get transactions and unspent transactions by address.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAddress = async(req, res) => {
    try {
        const qtxs = TX
            .aggregate([
                { $match: { 'vout.address': req.params.hash } },
                {
                    $project: {
                        vout: {
                            $filter: {
                                input: '$vout',
                                as: 'v',
                                cond: { $eq: ['$$v.address', req.params.hash] }
                            }
                        },
                        //blockHash: 1,
                        blockHeight: 1,
                        createdAt: 1,
                        txId: 1,
                        version: 1,
                        vin: 1,
                    }
                },
                { $sort: { blockHeight: -1 } }
            ])
            .limit(100) //@todo Limit too 100 transactions at the moment, until we implement proper serverside pagination 
            .allowDiskUse(true)
            .exec();
        const qutxo = UTXO
            .aggregate([
                { $match: { address: req.params.hash } },
                { $sort: { blockHeight: -1 } }
            ])
            .limit(100) //@todo Limit too 100 transactions at the moment, until we implement proper serverside pagination 
            .allowDiskUse(true)
            .exec();

        const masternodeForAddress = await Masternode.findOne({ addr: req.params.hash });
        const isMasternode = !!masternodeForAddress;

        const txs = await qtxs;
        const utxo = await qutxo;
        const balance = utxo.reduce((acc, tx) => acc + tx.value, 0.0);
        const received = txs.reduce((acc, tx) => acc + tx.vout.reduce((a, t) => a + t.value, 0.0), 0.0);

        res.json({ balance, received, txs, utxo, isMasternode });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Will return the average block time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgBlockTime = () => {
    // When does the cache expire.
    // For now this is hard coded.
    let cache = 90.0;
    let cutOff = moment().utc().add(60, 'seconds').unix();
    let loading = true;

    // Generate the average.
    const getAvg = async() => {
        loading = true;

        try {
            const date = moment.utc().subtract(24, 'hours').toDate();
            const blocksCount = await Block.count({ createdAt: { $gt: date } });
            const seconds = 24 * 60 * 60;

            cache = seconds / blocksCount;
            cutOff = moment().utc().add(60, 'seconds').unix();
        } catch (err) {
            console.log(err);
        } finally {
            if (!cache) {
                cache = 0.0;
            }

            loading = false;
        }
    };

    // Load the initial cache.
    getAvg();

    return async(req, res) => {
        res.json(cache || 0.0);

        // If the cache has expired then go ahead
        // and get a new one but return the current
        // cache for this request.
        if (!loading && cutOff <= moment().utc().unix()) {
            await getAvg();
        }
    };
};

/**
 * Will return the average masternode payout time over 24 hours.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getAvgMNTime = () => {
    // When does the cache expire.
    // For now this is hard coded.
    let cache = 24.0;
    let cutOff = moment().utc().add(5, 'minutes').unix();
    let loading = true;

    // Generate the average.
    const getAvg = async() => {
        loading = true;

        try {
            const date = moment.utc().subtract(24, 'hours').toDate();
            const blocksCount = await Block.count({ createdAt: { $gt: date } });
            const masternodesCount = await Masternode.count();

            cache = (24.0 / (blocksCount / masternodesCount));
            cutOff = moment().utc().add(5, 'minutes').unix();
        } catch (err) {
            console.log(err);
        } finally {
            if (!cache) {
                cache = 0.0;
            }

            loading = false;
        }
    };

    // Load the initial cache.
    getAvg();

    return async(req, res) => {
        res.json(cache || 0.0);

        // If the cache has expired then go ahead
        // and get a new one but return the current
        // cache for this request.
        if (!loading && cutOff <= moment().utc().unix()) {
            await getAvg();
        }
    };
};

/**
 * Get block by hash or height.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getBlock = async(req, res) => {
    try {
        const query = isNaN(req.params.hash) ? { hash: req.params.hash } : { height: req.params.hash };
        const block = await Block.findOne(query);
        if (!block) {
            res.status(404).send('Unable to find the block!');
            return;
        }

        const txs = await TX.find({ txId: { $in: block.txs } }, { involvedAddresses: 0 });

        res.json({ block, txs });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
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
 * Get history of coin information.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinHistory = (req, res) => {
    Coin.find()
        .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit, 10) : 12) // 12x5=60 mins
        .sort({ createdAt: -1 })
        .then((docs) => {
            res.json(docs);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err.message || err);
        });
};

/**
 * Return all the coins for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getCoinsWeek = () => {
    // When does the cache expire.
    // For now this is hard coded.
    let cache = [];
    let cutOff = moment().utc().add(1, 'hour').unix();
    let loading = true;

    // Aggregate the data and build the date list.
    const getCoins = async() => {
        loading = true;

        try {
            const start = moment().utc().subtract(8, 'days').toDate();
            const end = moment().utc().toDate();
            const qry = [
                // Select last 7 days of coins.
                { $match: { createdAt: { $gt: start, $lt: end } } },
                // Sort by _id/date field in ascending order (order -> newer)
                { $sort: { createdAt: 1 } }
            ];

            cache = await Coin.aggregate(qry);
            cutOff = moment().utc().add(90, 'seconds').unix();
        } catch (err) {
            console.log(err);
        } finally {
            loading = false;
        }
    };

    // Load the initial cache.
    getCoins();

    return async(req, res) => {
        res.json(cache);

        // If the cache has expired then go ahead
        // and get a new one but return the current
        // cache for this request.
        if (!loading && cutOff <= moment().utc().unix()) {
            await getCoins();
        }
    };
};

/**
 * Will return true if a block hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getIsBlock = async(req, res) => {
    try {
        let isBlock = false;

        // Search for block hash.
        const block = await Block.findOne({ hash: req.params.hash });
        if (block) {
            isBlock = true;
        }

        res.json(isBlock);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodes = async(req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

        var query = {};

        // Optionally it's possible to filter masternodes running on a specific address
        if (req.query.hash) {
            query.addr = req.query.hash;
        }

        // Optionally it's possible to filter masternodes running on a specific range of addresses. Pass in addresses as comma-seprated list
        // In redux we pass in an array and it automatically converts into a comma-seperated list of addresses
        if (req.query.addresses) {
            const addressList = req.query.addresses.split(',');
            // At the moment the limit of addresses in a single query is 25 but this number will be increased later, perhaps with some form of caching
            if (addressList.length < 25) {
                query.addr = { "$in": addressList };
            }
        }

        const total = await Masternode.count(query);
        const mns = await Masternode.find(query).skip(skip).limit(limit).sort({ lastPaidAt: -1, status: 1 });

        res.json({ mns, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Get a masternode by wallet adress hash from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeByAddress = async(req, res) => {
    try {
        const hash = req.params.hash;
        const mns = await Masternode.findOne({ addr: hash });

        res.json({ mns });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};
/**
 * Get Proposals Data from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */

const getProposals = async(req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const total = await Proposal.count();
        const pps = await Proposal.find().skip(skip).limit(limit);

        res.json({ pps, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};
/**
 * Get list of masternodes from the server.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getMasternodeCount = async(req, res) => {
    try {
        const masternodeCount = await cache.getFromCache("masternodeCount", moment().utc().add(60, 'seconds').unix(), async() => {
            const coin = await Coin.findOne().sort({ createdAt: -1 });
            return { enabled: coin.mnsOn, total: coin.mnsOff + coin.mnsOn };
        });

        res.json(masternodeCount);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Get the list of peers from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getPeer = (req, res) => {
    Peer.find()
        .skip(req.query.skip ? parseInt(req.query.skip, 10) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit, 10) : 500)
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
 * Get coin supply information for usage.
 * https://github.com/coincheckup/crypto-supplies
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getSupply = async(req, res) => {
    try {
        let c = 0; // Circulating supply.
        let t = 0; // Total supply.

        let supply = await cache.getFromCache("supply", moment().utc().add(1, 'hours').unix(), async() => {
            const utxo = await UTXO.aggregate([
                { $group: { _id: 'supply', total: { $sum: '$value' } } }
            ]);

            t = utxo[0].total;
            c = t;

            return { c, t };
        });

        res.json(supply);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Get the top 100 addresses from the database.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTop100 = async(req, res) => {
    try {
        const docs = await cache.getFromCache("top100", moment().utc().add(1, 'hours').unix(), async() => {
            return await Rich.find()
                .limit(100)
                .sort({ value: -1 });
        });

        res.json(docs);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXLatest = async(req, res) => {
    try {
        const docs = await cache.getFromCache("txLatest", moment().utc().add(90, 'seconds').unix(), async() => {
            return await TX.find({}, { involvedAddresses: 0 }) // Don't include involvedAddresses for txs as 1000 inputs would give 1000 extra addresses
                .populate('blockRewardDetails')
                .limit(10)
                .sort({ blockHeight: -1 });
        });

        res.json(docs);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Return the transaction information for given hash.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTX = async(req, res) => {
    try {
        const query = isNaN(req.params.hash) ? { txId: req.params.hash } : { height: req.params.hash };
        const tx = await TX.findOne(query).populate('blockRewardDetails');
        if (!tx) {
            res.status(404).send('Unable to find the transaction!');
            return;
        }

        res.json(tx);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXs = async(req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

        const total = await TX.count();
        const txs = await TX.find({}, { involvedAddresses: 0 }).populate('blockRewardDetails').skip(skip).limit(limit).sort({ blockHeight: -1 });

        //@todo If instant load txs get abused with mass input/output spam then we can output ones where inputs<=3 and outputs<=3

        res.json({ txs, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};

/**
 * Return a paginated list of transactions.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getRewards = async(req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

        const total = await BlockRewardDetails.count();
        const rewards = await BlockRewardDetails.find().skip(skip).limit(limit).sort({ blockHeight: -1 });

        res.json({ rewards, pages: total <= limit ? 1 : Math.ceil(total / limit) });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message || err);
    }
};



/**
 * Return all the transactions for an entire week.
 * Method uses a closure for caching.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
const getTXsWeek = () => {
    // When does the cache expire.
    // For now this is hard coded.
    let cache = [];
    let cutOff = moment().utc().add(1, 'hour').unix();
    let loading = true;

    // Aggregate the data and build the date list.
    const getTXs = async() => {
        loading = true;

        try {
            const start = moment().utc().startOf('day').subtract(7, 'days').toDate();
            const end = moment().utc().endOf('day').subtract(1, 'days').toDate();
            const qry = [
                // Select last 7 days of txs.
                { $match: { createdAt: { $gt: start, $lt: end } } },
                // Convert createdAt date field to date string.
                { $project: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
                // Group by date string and build total/sum.
                { $group: { _id: '$date', total: { $sum: 1 } } },
                // Sort by _id/date field in ascending order (order -> newer)
                { $sort: { _id: 1 } }
            ];

            cache = await TX.aggregate(qry);
            cutOff = moment().utc().add(90, 'seconds').unix();
        } catch (err) {
            console.log(err);
        } finally {
            loading = false;
        }
    };

    // Load the initial cache.
    getTXs();

    return async(req, res) => {
        res.json(cache);

        // If the cache has expired then go ahead
        // and get a new one but return the current
        // cache for this request.
        if (!loading && cutOff <= moment().utc().unix()) {
            await getTXs();
        }
    };
};

module.exports = {
    getAddress,
    getAvgBlockTime,
    getAvgMNTime,
    getBlock,
    getCoin,
    getCoinHistory,
    getCoinsWeek,
    getIsBlock,
    getMasternodes,
    getMasternodeByAddress,
    getProposals,
    getMasternodeCount,
    getPeer,
    getSupply,
    getTop100,
    getTXLatest,
    getTX,
    getTXs,
    getRewards,
    getTXsWeek
};