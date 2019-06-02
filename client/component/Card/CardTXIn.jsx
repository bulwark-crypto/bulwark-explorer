
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
        { key: 'address', title: 'Address' },
        { key: 'value', title: 'Value' }
      ]
    };

    // If any inputs have a related vout add some extra columns. 
    // Ex: Coinbase transactions would not have relatedVout so we don't need to show a bunch of empty data
    if (this.props.txs.some(tx => tx.relatedVout)) {
      this.state.cols = [
        { key: 'address', title: 'Address' },
        { key: 'age', title: 'Age' },
        { key: 'confirmations', title: 'Confirmations' },
        { key: 'value', title: 'Value' }
      ]
    }
  };

  render() {
    return (
      <Table
        cols={ this.state.cols }
        data={ this.props.txs.map(tx => ({
          ...tx,
          address: tx.relatedVout
            ? (<Link to={ `/address/${ tx.relatedVout.address }` }>{ tx.relatedVout.address }</Link>)
            : tx.coinbase ? 'COINBASE' : 'Unknown',
          age: tx.relatedVout
            ? (<Link to={ `/address/${ tx.relatedVout.address }` }>{ (tx.relatedVout.age / 60 / 60).toFixed(2) }h</Link>)
            : '',
          confirmations: tx.relatedVout
            ? (<Link to={ `/address/${ tx.relatedVout.address }` }>{ tx.relatedVout.confirmations }</Link>)
            : '',
          value: tx.relatedVout
            ? (
                <span className="badge badge-danger">
                  -{ numeral(tx.relatedVout.value).format('0,0.0000') } BWK
                </span>
              )
            : ''
        })) } />
    );
  };
}
