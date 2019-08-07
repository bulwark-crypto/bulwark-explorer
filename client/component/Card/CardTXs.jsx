
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
        { key: 'label', title: 'Transaction Hash' },
        { key: 'valueOut', title: 'Value' },
        { key: 'countIn', title: 'Inputs' },
        { key: 'countOut', title: 'Outputs' },
        { key: 'date', title: 'Created' },
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
          let blockValue = tx.valueOut;
         
          let spanClassName = ``;
          if (this.props.addBadgeClassToValue) {
            spanClassName = `badge badge-${blockValue < 0 ? 'danger' : 'success'}`;
          }

          return ({
            ...tx,
            blockHeight: (
              <Link to={`/block/${tx.blockHeight}`}>
                {tx.blockHeight}
              </Link>
            ),
            label: (
              <Link to={`/tx/${tx.label}`}>
                {tx.label}
              </Link>
            ),
            valueOut: (
              <span className={spanClassName}>
                <Link to={`/tx/${tx.label}`}>
                  {TransactionValue(tx, blockValue)}
                </Link>
              </span>
            ),
            countIn: (
              <Link to={`/tx/${tx.label}`}>
                {tx.countIn}
              </Link>
            ),
            countOut: (
              <Link to={`/tx/${tx.label}`}>
                {tx.countOut}
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
