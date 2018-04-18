
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardAddressTXs extends Component {
  static defaultProps = {
    address: '',
    txs: [],
    utxo: []
  };

  static propTypes = {
    address: PropTypes.string.isRequired,
    txs: PropTypes.array.isRequired,
    utxo: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'txId', title: 'Transaction ID' },
        { key: 'amount', title: 'Amount' },
        { key: 'createdAt', title: 'Time' },
      ]
    };
  };

  render() {
    const spentTXs = new Set(
      this.props.utxo.map(tx => `${ tx.txId }:${ tx.n }`)
    );

    return (
      <div className="animated fadeIn">
      <Table
        cols={ this.state.cols }
        data={ this.props.txs.map((tx) => {
          let amount = 0.0;
          let isSpent = false;
          tx.vout.forEach((vout) => {
            if (vout.address === this.props.address) {
              amount += vout.value;
              isSpent = !spentTXs.has(`${ tx.txId }:${ vout.n }`);
            }
          });

          return ({
            ...tx,
            amount: (
              <span
                className={ `badge badge-${ isSpent ? 'danger' : 'success' }` }>
                { isSpent ? '-' : ''}{ numeral(amount).format('0,0.0000') } BWK
              </span>
            ),
            createdAt: dateFormat(tx.createdAt),
            txId: (
              <Link to={ `/tx/${ tx.txId }` }>{ tx.txId }</Link>
            )
          });
        }) } />
        </div>
    );
  };
}
