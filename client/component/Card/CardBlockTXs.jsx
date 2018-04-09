
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardBlockTXs extends Component {
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
        { key: 'recipients', title: 'Recipients' },
        { key: 'createdAt', title: 'Time' },
      ]
    };
  };

  render() {
    return (
      <div className="animated fadeIn">
      <Table
        cols={ this.state.cols }
        data={ this.props.txs.map(tx => ({
          ...tx,
          createdAt: dateFormat(tx.createdAt),
          recipients: tx.vout.length,
          txId: (
            <Link to={ `/tx/${ tx.txId }` }>{ tx.txId }</Link>
          )
        })) } />
        </div>
    );
  };
}
