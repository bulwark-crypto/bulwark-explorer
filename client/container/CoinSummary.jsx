
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardMarket from '../component/Card/CardMarket';
import CardMasternodeSummary from '../component/Card/CardMasternodeSummary';
import CardNetworkSummary from '../component/Card/CardNetworkSummary';
import CardStatus from '../component/Card/CardStatus';
import WatchList from '../component/WatchList';

class CoinSummary extends Component {
  static propTypes = {
    coins: PropTypes.array.isRequired,
    txs: PropTypes.array.isRequired
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
                <CardStatus
                  blocks={ this.props.txs.length
                    ? this.props.txs[0].height
                    : coin.blocks
                  }
                  peers={ coin.peers }
                  status={ coin.status } />
              </div>
              <div className="col-12 col-md-6">
                <CardNetworkSummary
                  difficulty={ coin.diff }
                  hashps={ coin.netHash }
                  xAxis={ this.props.coins.map(c => c.createdAt) }
                  yAxis={ this.props.coins.map(c => c.diff ? c.diff : 0.0) } />
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6">
                <CardMarket
                  btc={ coin.btc }
                  usd={ coin.usd }
                  xAxis={ this.props.coins.map(c => c.createdAt) }
                  yAxis={ this.props.coins.map(c => c.usd ? c.usd : 0.0) } />
              </div>
              <div className="col-12 col-md-6">
                <CardMasternodeSummary
                  offline={ coin.mnsOff }
                  online={ coin.mnsOn }
                  xAxis={ this.props.coins.map(c => c.createdAt) }
                  yAxis={ this.props.coins.map(c => c.mnsOn ? c.mnsOn : 0.0) } />
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

});

const mapState = state => ({
  coins: state.coins,
  txs: state.txs
});

export default connect(mapState, mapDispatch)(CoinSummary);
