
import chai from 'chai';
import http from 'chai-http';
import server from '../../server/src';

const should = chai.should();

chai.use(http);

describe('API', () => {
    it('getinfo', (done) => {
        chai.request(server)
            .get('/api/getinfo')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.version.should.be.a('number');
                res.body.result.protocolversion.should.be.a('number');
                res.body.result.walletversion.should.be.a('number');
                res.body.result.blocks.should.be.a('number');
                res.body.result.difficulty.should.be.a('number');
                done();
            });
    });

    it('getnetworkhashps', (done) => {
        chai.request(server)
            .get('/api/getnetworkhashps')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('number');
                done();
            });
    });

    it('getmininginfo', (done) => {
        chai.request(server)
            .get('/api/getmininginfo')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.blocks.should.be.a('number');
                res.body.result.difficulty.should.be.a('number');
                res.body.result.chain.should.be.a('string');
                done();
            });
    });

    it('getdifficulty', (done) => {
        chai.request(server)
            .get('/api/getdifficulty')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('number');
                done();
            });
    });

    it('getconnectioncount', (done) => {
        chai.request(server)
            .get('/api/getconnectioncount')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('number');
                done();
            });
    });

    it('getblockcount', (done) => {
        chai.request(server)
            .get('/api/getblockcount')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('number');
                done();
            });
    });

    it('getblockhash', (done) => {
        chai.request(server)
            .get('/api/getblockhash?index=0')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('string');
                res.body.result.should.eq('0000068e7ab8e264f6759d2d81b29e8b917c10b04db47a9a0bb3cba3fba5d574');
                done();
            });
    });

    it('getblock', (done) => {
        chai.request(server)
            .get('/api/getblock?hash=0000068e7ab8e264f6759d2d81b29e8b917c10b04db47a9a0bb3cba3fba5d574')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.hash.should.be.a('string');
                res.body.result.confirmations.should.be.a('number');
                res.body.result.version.should.be.a('number');
                res.body.result.merkleroot.should.be.a('string');
                res.body.result.tx.should.be.a('array');
                res.body.result.time.should.be.a('number');
                res.body.result.nonce.should.be.a('number');
                res.body.result.bits.should.be.a('string');
                res.body.result.difficulty.should.be.a('number');
                res.body.result.chainwork.should.be.a('string');
                done();
            });
    });
    
    it('getrawtransaction', (done) => {
        chai.request(server)
            .get('/api/getrawtransaction?txid=788282ec3f87feffb231e7a2f12a3e9883355e4f30b9e5be6255d4523f6e2357')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('string');
                res.body.result.should.eq('01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff03510101ffffffff0100f8a92e8a2c000023210240b7da431af18442e8d2dab9f68be934c955f1a218a7b6bb1e4f6cddabe25a74ac00000000');
                done();
            });
    });

    it('getpeerinfo', (done) => {
        chai.request(server)
            .get('/api/getpeerinfo')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('array');
                done();
            });
    });

    it('gettxoutsetinfo', (done) => {
        chai.request(server)
            .get('/api/gettxoutsetinfo')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('object');
                res.body.result.height.should.be.a('number');
                res.body.result.transactions.should.be.a('number');
                res.body.result.txouts.should.be.a('number');
                res.body.result.bytes_serialized.should.be.a('number');
                res.body.result.total_amount.should.be.a('number');
                done();
            });
    });

    it('getmasternodecount', (done) => {
        chai.request(server)
            .get('/api/getmasternodecount')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('object');
                res.body.result.total.should.be.a('number');
                res.body.result.stable.should.be.a('number');
                res.body.result.enabled.should.be.a('number');
                res.body.result.ipv4.should.be.a('number');
                res.body.result.ipv6.should.be.a('number');
                res.body.result.onion.should.be.a('number');
                done();
            });
    });

    it('masternodelist', (done) => {
        chai.request(server)
            .get('/api/masternodelist')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('array');
                done();
            });
    });
});