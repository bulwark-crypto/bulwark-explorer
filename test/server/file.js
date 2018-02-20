
import chai from 'chai';
import http from 'chai-http';
import server from '../../server';

const should = chai.should();

chai.use(http);

describe('API (index.html)', () => {
  it('public', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
