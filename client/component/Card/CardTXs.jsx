
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardTXs extends Component {
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
        { key: 'blockHeight', title: 'Height' },
        { key: 'txId', title: 'Transaction Hash' },
        { key: 'vout', title: 'Value' },
        { key: 'age', title: 'Age' },
        { key: 'recipients', title: 'Recipients' },
        { key: 'createdAt', title: 'Created' },
      ]
    };
  };

  render() {
    return (
      <Table
        cols={ this.state.cols }
        data={ this.props.txs.map(tx => {
          const createdAt = moment(tx.createdAt).utc();
          const diffSeconds = moment().utc().diff(createdAt, 'seconds');
          let blockValue = 0.0;
          if (tx.vout && tx.vout.length) {
            tx.vout.forEach(vout => blockValue += vout.value);
          }

          return ({
            ...tx,
            age: diffSeconds < 60 ? `${ diffSeconds } seconds` : createdAt.fromNow(true),
            blockHeight: (
              <Link to={ `/block/${ tx.blockHeight }` }>
                { tx.blockHeight }
              </Link>
            ),
            createdAt: dateFormat(tx.createdAt),
            recipients: tx.vout.length,
            txId: (
              <Link to={ `/tx/${ tx.txId }` }>
                { tx.txId }
              </Link>
            ),
            vout: (
              <span className={ `badge badge-${ blockValue < 0 ? 'danger' : 'success' }` }>
                { numeral(blockValue).format('0,0.0000') }
              </span>
            )
          });
        }) } />
    );
  };
}
