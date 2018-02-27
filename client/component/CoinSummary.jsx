
import Actions from 'core/Actions';
import Component from 'core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardMarket from 'component/Card/CardMarket';
import CardMasternodeSummary from 'component/Card/CardMasternodeSummary';
import CardNetworkSummary from 'component/Card/CardNetworkSummary';
import CardStatus from 'component/Card/CardStatus';
import WatchList from 'component/WatchList';

class CoinSummary extends Component {
  static propTypes = {
    coins: PropTypes.array.isRequired,
    getHistory: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = { init: true };
    this.timeout = null;
  };

  componentDidMount() {
    this.props
      .getHistory({ limit: 10 })
      .then(this.getHistory)
      .catch(this.getHistory);
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  };

  getHistory = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.props
        .getHistory({ limit: 10 })
        .then(this.getHistory)
        .catch(this.getHistory);
    }, 60000); // 1 minute/60 seconds

    if (this.state.init) {
      this.setState({ init: false });
    }
  };

  render() {
    const coin = this.props.coins && this.props.coins.length
      ? this.props.coins[0]
      : { diff: 0, netHash: 0 };

    // TODO: add actual feature.
    const watchListItems = [
      '4FGjklsdf234j23lkj324jl3k242lkj324kl234',
      '4FGjklsdf234j23lkj324jl3k242lkj324kl234',
      '4FGjklsdf234j23lkj324jl3k242lkj324kl234',
    ];

    return (
      <div>
        <div className="row">
          <div className="col-12 col-md-9">
            <div className="row">
              <div className="col-12 col-md-6">
                <CardStatus />
              </div>
              <div className="col-12 col-md-6">
                { !this.state.init &&
                  <CardNetworkSummary
                    difficulty={ coin.diff }
                    hashps={ coin.netHash }
                    xAxis={ this.props.coins.map(c => c.createdAt) }
                    yAxis={ this.props.coins.map(c => c.diff) } />
                }
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6">
                <CardMarket />
              </div>
              <div className="col-12 col-md-6">
                { !this.state.init &&
                  <CardMasternodeSummary
                    offline={ coin.mnsOff }
                    online={ coin.mnsOn }
                    xAxis={ this.props.coins.map(c => c.createdAt) }
                    yAxis={ this.props.coins.map(c => c.mnsOn) } />
                }
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <WatchList items={ watchListItems } />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getHistory: query => Actions.getCoinHistory(dispatch, query)
});

const mapState = state => ({
  coins: state.coins
});

export default connect(mapState, mapDispatch)(CoinSummary);
