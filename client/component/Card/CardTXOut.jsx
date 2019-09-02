
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';
import config from '../../../config'

import CarverAddressLabelWidget from '../AddressWidgets/CarverAddressLabelWidget'

//@todo this is wrong name for this card, it should be CardVouts
export default class CardTXOut extends Component {
  static defaultProps = {
    txs: [] //@todo should be vouts
  };

  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'address', title: 'Address' },
        { key: 'value', title: 'Amount' }
      ]
    };
  };

  render() {
    return (
      <Table
        cols={this.state.cols}
        data={this.props.txs.map(tx => ({
          ...tx,
          address: (
            <Link to={`/address/${tx.label}`}><CarverAddressLabelWidget carverAddress={tx.carverAddress} /></Link>
          ),
          value: (
            <span className="badge badge-success">
              {numeral(tx.amount).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
            </span>
          )
        }))} />
    );
  };
}
