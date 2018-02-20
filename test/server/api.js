
import chai from 'chai';
import http from 'chai-http';
import server from '../../server';

const expect = chai.expect;
const should = chai.should;

chai.use(http);

describe('API', () => {
  it('/api/tx/latest', (done) => {
    chai.request(server)
      .get('/api/tx/latest')
      .query({ limit: 1 })
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.a('array');
        expect(res.body.length).to.eq(1);
        done();
      });
  });
});
