
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import GraphLineFull from '../component/Graph/GraphLineFull';
import HorizontalRule from '../component/HorizontalRule';
import Notification from '../component/Notification';

class Statistics extends Component {
  static propTypes = {
    // State
    coin: PropTypes.object.isRequired,
    // Dispatch
    getCoins: PropTypes.func.isRequired,
    getTXs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      coins: [],
      error: null,
      loading: true,
      txs: []
    };
  };

  componentDidMount() {
    Promise.all([
        this.props.getCoins(),
        this.props.getTXs()
      ])
      .then((res) => {
        this.setState({
          coins: res[0], // 7 days at 5 min = 2016 coins
          loading: false,
          txs: res[1]
        });
      });
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }

    let tTX = 0;
    this.state.txs.forEach((tx) => {
      tTX += tx.total;
    });
    const avgTX = ((tTX / 7) / 24) / this.state.txs.length;

    // Setup graph data objects.
    const hashes = new Map();
    const mns = new Map();
    const prices = new Map();
    this.state.coins.forEach((c, idx) => {
      const k = moment(c.createdAt).format('MMM DD');

      if (hashes.has(k)) {
        hashes.set(k, hashes.get(k) + c.netHash);
      } else {
        hashes.set(k, c.netHash);
      }

      if (mns.has(k)) {
        mns.set(k, mns.get(k) + c.mnsOn);
      } else {
        mns.set(k, c.mnsOn);
      }

      if (prices.has(k)) {
        prices.set(k, prices.get(k) + c.usd);
      } else {
        prices.set(k, c.usd);
      }
    });

    // Generate averages for each key in each map.
    const l = (24 * 60) / 5; // How many 5 min intervals in a day.
    let avgHash, avgMN, avgPrice = 0.0;
    let hashLabel = 'H/s';
    hashes.forEach((v, k) => {
      const { hash, label } = this.formatNetHash(v / l);
      hashLabel = label; // For use in graph.
      avgHash += hash;
      hashes.set(k, numeral(hash).format('0,0.00'));
    });
    mns.forEach((v, k) => {
      avgMN += v / l;
      mns.set(k, numeral(v / l).format('0,0'));
    });
    prices.forEach((v, k) => {
      avgPrice += v / l;
      prices.set(k, numeral(v / l).format('0,0.00'));
    });
    avgHash = avgHash / hashes.size;
    avgMN = avgMN / mns.size;
    avgPrice = avgPrice / prices.size;

    // Get the current hash format and label.
    const netHash = this.formatNetHash(this.props.coin.netHash);

    // Setup the labels for the transactions per day map.
    const txs = new Map();
    this.state.txs.forEach((t) => {
      txs.set(moment(t._id, 'YYYY-MM-DD').format('MMM DD'), t.total);
    });

    // Get the current day of the month.
    const day = (<small>{ moment().format('MMM DD') }</small>);

    return (
      <div className="animated fadeInUp">
        <HorizontalRule title="Statistics" />
        { Array.from(hashes.keys()).slice(1, -1).length <= 6 && <Notification /> }
        <div>
          <div className="row">
            <div className="col-md-12 col-lg-6">
              <h3>Network Hash Rate Last 7 Days</h3>
              <h4>{ numeral(netHash.hash).format('0,0.0000') } { netHash.label }/s { day }</h4>
              <h5>Difficulty: { numeral(this.props.coin.diff).format('0,0.0000') }</h5>
              <div>
                <GraphLineFull
                  color="#1991eb"
                  data={ Array.from(hashes.values()).slice(1, -1) }
                  height="420px"
                  labels={ Array.from(hashes.keys()).slice(1, -1) } />
              </div>
            </div>
            <div className="col-md-12 col-lg-6">
              <h3>Transactions Last 7 Days</h3>
              <h4>{ numeral(tTX).format('0,0') } { day }</h4>
              <h5>Average: { numeral(avgTX).format('0,0') } Per Hour</h5>
              <div>
                <GraphLineFull
                  color="#1991eb"
                  data={ Array.from(txs.values()) }
                  height="420px"
                  labels={ Array.from(txs.keys()) } />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-lg-6">
              <h3>Bulwark Price USD</h3>
              <h4>{ numeral(this.props.coin.usd).format('$0,0.00') } { day }</h4>
              <h5>{ numeral(this.props.coin.btc).format('0.00000000') } BTC</h5>
              <div>
                <GraphLineFull
                  color="#1991eb"
                  data={ Array.from(prices.values()).slice(1, -1) }
                  height="420px"
                  labels={ Array.from(prices.keys()).slice(1, -1) } />
              </div>
            </div>
            <div className="col-md-12 col-lg-6">
              <h3>Masternodes Online Last 7 Days</h3>
              <h4>{ this.props.coin.mnsOn } { day }</h4>
              <h5>Seen: { this.props.coin.mnsOn + this.props.coin.mnsOff }</h5>
              <div>
                <GraphLineFull
                  color="#1991eb"
                  data={ Array.from(mns.values()).slice(1, -1) }
                  height="420px"
                  labels={ Array.from(mns.keys()).slice(1, -1) } />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getCoins: () => Actions.getCoinsWeek(dispatch),
  getTXs: () => Actions.getTXsWeek(dispatch)
});

const mapState = state => ({
  coin: state.coin
});

export default connect(mapState, mapDispatch)(Statistics);
