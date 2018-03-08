
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';

class Top100 extends Component {
  static defaultProps = {
    coin: {}
  };

  static propTypes = {
    coin: PropTypes.object.isRequired,
    getTop100: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: '_id', title: 'Address' },
        { key: 'total', title: 'Total' },
        { key: 'percent', title: '%' },
      ],
      wallets: []
    };
  };

  componentDidMount() {
    this.props.getTop100().then(wallets => this.setState({ wallets }));
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Top 100" />
        <Table
          cols={ this.state.cols }
          data={ this.state.wallets.map(wallet => ({
            ...wallet,
            percent: numeral(wallet.value / this.props.coin.supply).format('0,0.00')
          })) } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTop100: () => Actions.getTop100()
});

const mapState = state => ({
  coin: state.coins.length ? state.coins[0] : {}
});

export default connect(null, mapDispatch)(Top100);
