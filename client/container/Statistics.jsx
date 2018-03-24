
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import GraphLineFull from '../component/Graph/GraphLineFull';

class Statistics extends Component {
  static propTypes = {
    // Dispatch
    getCoins: PropTypes.func.isRequired,
    getTXs: PropTypes.func.isRequired,
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

    const coin = this.state.coins.length
      ? this.state.coins[this.state.coins.length - 1]
      : {
          diff: 0.0,
          netHash: 0.0
        };

    let tTX = 0;
    this.state.txs.forEach((tx) => {
      tTX += tx.total;
    });
    const avgTX = ((tTX / 7) / 24) / this.state.txs.length;
    const diff = coin.diff;

    const labels = ['H', 'kH', 'MH', 'GH', 'TH'];
    let hash = coin.netHash;
    let idx = 0;
    while (hash > 1000) {
      hash = hash / 1000;
      idx++;
    }

    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-lg-6">
            <h3>Network Hash Rate Last 7 Days</h3>
            <h4>{ numeral(hash).format('0,0.0000') } { labels[idx] }/s</h4>
            <h5>Difficulty: { numeral(diff).format('0,0.0000') }</h5>
            <div>
              <GraphLineFull
                color="#1991eb"
                data={ this.state.coins.reverse().map(c => c.netHash ? c.netHash : 0.0) }
                height="420px"
                hideLines={ false }
                labels={ this.state.coins.reverse().map(c => c.createdAt) } />
            </div>
          </div>
          <div className="col-md-12 col-lg-6">
            <h3>Transactions Last 7 Days</h3>
            <h4>{ numeral(tTX).format('0,0') }</h4>
            <h5>Average: { numeral(avgTX).format('0,0') } Per Hour</h5>
            <div>
              <GraphLineFull
                color="#1991eb"
                data={ this.state.txs.map(c => c.total ? c.total : 0.0) }
                height="420px"
                hideLines={ false }
                labels={ this.state.txs.map(c => c._id) } />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-lg-6">
            <h3>Bulwark Price USD</h3>
            <h4>{ numeral(coin.usd).format('$0,0.00') }</h4>
            <h5>{ numeral(coin.btc).format('0.00000000') } BTC</h5>
            <div>
              <GraphLineFull
                color="#1991eb"
                data={ this.state.coins.reverse().map(c => c.usd ? c.usd : 0.0) }
                height="420px"
                hideLines={ false }
                labels={ this.state.coins.reverse().map(c => c.createdAt) } />
            </div>
          </div>
          <div className="col-md-12 col-lg-6">
            <h3>Masternodes Online Last 7 Days</h3>
            <h4>{ coin.mnsOn }</h4>
            <h5>Seen: { coin.mnsOn + coin.mnsOff }</h5>
            <div>
              <GraphLineFull
                color="#1991eb"
                data={ this.state.coins.reverse().map(c => c.mnsOn ? c.mnsOn : 0) }
                height="420px"
                hideLines={ false }
                labels={ this.state.coins.reverse().map(c => c.createdAt) } />
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

});

export default connect(mapState, mapDispatch)(Statistics);
