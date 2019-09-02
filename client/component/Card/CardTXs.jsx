
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';
import TransactionValue from '../../component/Table/TransactionValue';

export default class CardTXs extends Component {
  static defaultProps = {
    txs: [],
    addBadgeClassToValue: true
  };

  static propTypes = {
    txs: PropTypes.array.isRequired,
    addBadgeClassToValue: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'blockHeight', title: 'Height' },
        { key: 'txId', title: 'Transaction Hash' },
        { key: 'amount', title: 'Amount' },
        { key: 'addressesIn', title: 'Addresses In' },
        { key: 'addressesOut', title: 'Addresses Out' },
        { key: 'date', title: 'Date' },
      ]
    };
  };

  render() {
    return (
      <Table
        cols={this.state.cols}
        data={this.props.txs.map(tx => {
          const date = moment(tx.date).utc();
          const diffSeconds = moment().utc().diff(date, 'seconds');
          let amount = tx.amount;

          let spanClassName = ``;
          if (this.props.addBadgeClassToValue) {
            spanClassName = `badge badge-${amount < 0 ? 'danger' : 'success'}`;
          }

          return ({
            ...tx,
            blockHeight: (
              <Link to={`/block/${tx.blockHeight}`}>
                {tx.blockHeight}
              </Link>
            ),
            txId: (
              <Link to={`/tx/${tx.label}`}>
                {tx.txId}
              </Link>
            ),
            amount: (
              <span className={spanClassName}>
                <Link to={`/tx/${tx.label}`}>
                  {TransactionValue(tx, amount)}
                </Link>
              </span>
            ),
            addressesIn: (
              <Link to={`/tx/${tx.label}`}>
                {tx.addressesIn}
              </Link>
            ),
            addressesOut: (
              <Link to={`/tx/${tx.label}`}>
                {tx.addressesOut}
              </Link>
            ),
            date: (
              <Link to={`/tx/${tx.date}`} className="text-nowrap">
                {dateFormat(tx.date)} ({diffSeconds < 60 ? `${diffSeconds} seconds` : date.fromNow(true)})
              </Link>
            ),
          });
        })} />
    );
  };
}
