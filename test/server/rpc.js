
import chai from 'chai';
import RPC from '../../lib/rpc';

const expect = chai.expect;
const rpc = new RPC();
const should = chai.should();

describe('RPC', () => {
  it('getinfo', (done) => {
    rpc.call('getinfo')
      .then((res) => {
        res.version.should.be.a('number');
        res.protocolversion.should.be.a('number');
        res.walletversion.should.be.a('number');
        res.blocks.should.be.a('number');
        res.difficulty.should.be.a('number');
        done();
      });
  });

  it('getnetworkhashps', (done) => {
    rpc.call('getnetworkhashps')
      .then((res) => {
        res.should.be.a('number');
        done();
      });
  });

  it('getblockhash', (done) => {
    rpc.call('getblockhash', [0])
      .then((res) => {
        res.should.be.a('string');
        res.should.eq('0000068e7ab8e264f6759d2d81b29e8b917c10b04db47a9a0bb3cba3fba5d574');
        done();
      });
  });

  it('getblock', (done) => {
    rpc.call('getblock', ['0000068e7ab8e264f6759d2d81b29e8b917c10b04db47a9a0bb3cba3fba5d574'])
      .then((res) => {
        res.hash.should.be.a('string');
        res.confirmations.should.be.a('number');
        res.version.should.be.a('number');
        res.merkleroot.should.be.a('string');
        res.tx.should.be.a('array');
        res.time.should.be.a('number');
        res.nonce.should.be.a('number');
        res.bits.should.be.a('string');
        res.difficulty.should.be.a('number');
        res.chainwork.should.be.a('string');
        done();
      });
  });

  it('getrawtransaction', (done) => {
    rpc.call('getrawtransaction', ['788282ec3f87feffb231e7a2f12a3e9883355e4f30b9e5be6255d4523f6e2357'])
      .then((res) => {
        res.should.be.a('string');
        res.should.eq('01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff03510101ffffffff0100f8a92e8a2c000023210240b7da431af18442e8d2dab9f68be934c955f1a218a7b6bb1e4f6cddabe25a74ac00000000');
        done();
      });
  });

  it('getpeerinfo', (done) => {
    rpc.call('getpeerinfo')
      .then((res) => {
        res.should.be.a('array');
        done();
      });
  });

  it('getmasternodecount', (done) => {
    rpc.call('getmasternodecount')
      .then((res) => {
        res.should.be.a('object');
        res.total.should.be.a('number');
        res.stable.should.be.a('number');
        res.enabled.should.be.a('number');
        res.ipv4.should.be.a('number');
        res.ipv6.should.be.a('number');
        res.onion.should.be.a('number');
        done();
      });
  });

  it('masternode list', (done) => {
    rpc.call('masternode', ['list'])
      .then((res) => {
        res.should.be.a('array');
        done();
      });
  });
});
