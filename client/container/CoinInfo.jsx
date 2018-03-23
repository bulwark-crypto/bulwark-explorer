
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardEarnings from '../component/Card/CardEarnings';
import CardExchanges from '../component/Card/CardExchanges';
import CardLinks from '../component/Card/CardLinks';
import CardROI from '../component/Card/CardROI';
import HorizontalRule from '../component/HorizontalRule';

class CoinInfo extends Component {
  static propTypes = {
    coin: PropTypes.object.isRequired
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Coin Info" />
        <div className="row">
          <div className="col-md-12 col-lg-8">
            <div>
              <img className="img-fluid" src="/img/largelogo.svg" />
            </div>
            <div className="row">
              <div className="col-sm-12 col-md-3">
                <CardLinks />
                <CardExchanges />
              </div>
              <div className="col-sm-12 col-md-9">
                <CardEarnings coin={ this.props.coin } />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <CardROI coin={ this.props.coin } />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({

});

const mapState = state => ({
  coin: state.coins.length ? state.coins[0] : {},
  txs: state.txs
});

export default connect(mapState, mapDispatch)(CoinInfo);
