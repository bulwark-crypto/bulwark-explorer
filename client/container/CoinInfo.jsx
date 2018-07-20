

import Actions from '../core/Actions';
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
    coin: PropTypes.object.isRequired,
    getSupply: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      supply: { c: 0.0, t: 0.0 }
    };
  };

  componentDidMount() {
    this.props
      .getSupply()
      .then(supply => this.setState({ supply }))
      .catch(error => this.setState({ error }));
  };

  render() {
    if (this.state.error) {
      return this.renderError(this.state.error);
    }

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
            <CardROI
              coin={ this.props.coin }
              supply={ this.state.supply } />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getSupply: () => Actions.getSupply(dispatch)
});

const mapState = state => ({
  coin: state.coins.length ? state.coins[0] : {},
  txs: state.txs
});

export default connect(mapState, mapDispatch)(CoinInfo);
