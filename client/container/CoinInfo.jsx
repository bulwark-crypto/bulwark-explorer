
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CoinSummary from 'component/CoinSummary';
import HorizontalRule from 'component/HorizontalRule';

class CoinInfo extends Component {
  render() {
    return (
      <div>
        <CoinSummary />
        <HorizontalRule title="Coin Info" />
        <img src="https://bulwarkcrypto.com/wp-content/uploads/2018/01/Badge-Asset-9.png" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  clear: () => dispatch({ payload: [], type: TXS }),
  getLatest: query => Actions.getTXLatest(dispatch, query)
});

const mapState = state => ({
  txs: state.txs
});

export default connect(mapState, mapDispatch)(CoinInfo);
