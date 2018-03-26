
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
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
        { key: 'index', title: '#' },
        { key: 'address', title: 'Address' },
        { key: 'value', title: 'Total' },
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
          data={ this.state.wallets.map((wallet, idx) => ({
            ...wallet,
            address: (
              <Link to={ `/address/${ wallet.address }` }>{ wallet.address }</Link>
            ),
            index: idx + 1,
            percent: numeral((wallet.value / this.props.coin.supply) * 100.0).format('0,0.00'),
            value: numeral(wallet.value).format('0,0.0000')
          })) } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTop100: () => Actions.getTop100()
});

const mapState = state => ({
  coin: state.coin
});

export default connect(mapState, mapDispatch)(Top100);
