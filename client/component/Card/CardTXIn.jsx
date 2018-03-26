
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardTXIn extends Component {
  static defaultProps = {
    txs: []
  };

  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'txId', title: 'Transaction ID' },
        { key: 'vout', title: 'Index' }
      ]
    };
  };

  render() {
    return (
      <Table
        cols={ this.state.cols }
        data={ this.props.txs.map(tx => ({
          ...tx,
          txId: tx.txId
            ? (<Link to={ `/tx/${ tx.txId }` }>{ tx.txId }</Link>)
            : tx.coinbase ? 'COINBASE' : ''
        })) } />
    );
  };
}
