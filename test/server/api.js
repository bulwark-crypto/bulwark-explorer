
import chai from 'chai';
import http from 'chai-http';
import server from '../../server';

const expect = chai.expect;
const should = chai.should();

chai.use(http);

describe('API', () => {
  it('/api/address/:hash', (done) => {
    chai.request(server)
      .get('/api/address/bXPPis5Gf4y3stXahsKFfjXaR29TtN7yNd')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/block/hash/:hash', (done) => {
    chai.request(server)
      .get('/api/block/hash/0000000000004dbcd7d0ca813e318ea5154357eef2d75bb491fba6e9241949b7')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/block/height/:height', (done) => {
    chai.request(server)
      .get('/api/block/height/36007')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/coin', (done) => {
    chai.request(server)
      .get('/api/coin')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        if (res.body) {
          res.body.should.be.a('object');
          res.body.blocks.should.be.a('number');
          res.body.btc.should.be.a('number');
          res.body.cap.should.be.a('number');
          res.body.diff.should.be.a('number');
          res.body.mnsOff.should.be.a('number');
          res.body.mnsOn.should.be.a('number');
          res.body.netHash.should.be.a('number');
          res.body.peers.should.be.a('number');
          res.body.status.should.be.a('string');
          res.body.supply.should.be.a('number');
          res.body.usd.should.be.a('number');
        }
        done();
      });
  });

  it('/api/coin/history', (done) => {
    chai.request(server)
      .get('/api/coin/history')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/peer', (done) => {
    chai.request(server)
      .get('/api/peer')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/peer/history', (done) => {
    chai.request(server)
      .get('/api/peer/history')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/tx/latest', (done) => {
    chai.request(server)
      .get('/api/tx/latest')
      .query({ limit: 1 })
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.a('array');
        if (res.body.length) {
          expect(res.body.length).to.gte(1);
        }
        done();
      });
  });

  it('/api/tx/:hash', (done) => {
    chai.request(server)
      .get('/api/tx/7ca4b28da5304e4a9deb70a156dabcbf1dce86198aab2696ea8b1467cc70c754')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });
});
