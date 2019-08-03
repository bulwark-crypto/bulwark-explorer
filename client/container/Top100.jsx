
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from './../../config'
import moment from 'moment';
import CarverAddressLabelWidget from '../component/AddressWidgets/CarverAddressLabeWidget'

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
        { key: 'value', title: 'Balance' },
        { key: 'posRewards', title: 'Rewards' },
        { key: 'date', title: 'Age' },
        { key: 'lastMovementAgo', title: 'Active' },
        { key: 'percent', title: '%' },
      ],
      carverAddresses: []
    };
  };

  componentDidMount() {
    this.props.getTop100().then(carverAddresses => this.setState({ carverAddresses }));
  };


  render() {
    return (
      <div>
        <HorizontalRule title="Top 100" />
        <Table
          cols={this.state.cols}
          data={this.state.carverAddresses.map((carverAddress, idx) => ({
            ...carverAddress,
            address: (
              <Link to={`/address/${carverAddress.label}`}><CarverAddressLabelWidget carverAddress={carverAddress} /></Link>
            ),
            date: moment(carverAddress.date).utc().fromNow(true),
            lastMovementAgo: moment(carverAddress.lastMovementDate).utc().fromNow(),
            inputs: carverAddress.countIn - carverAddress.posCountIn,
            posRewards: numeral(carverAddress.posValueIn + carverAddress.powValueIn).format('0,0.00'),
            index: idx + 1,
            percent: numeral((carverAddress.balance / this.props.coin.supply) * 100.0).format('0,0.00'),
            value: numeral(carverAddress.balance).format('0,0.00')
          }))} />
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
