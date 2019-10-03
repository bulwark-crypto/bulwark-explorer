
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import numeral from 'numeral';
import config from './../../../config'
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
        { key: 'addressesIn', title: 'Sources' },
        { key: 'addressesOut', title: 'Recipients' },
        { key: 'value', title: 'Value' },
      ]
    };
  };

  render() {
    const getTxIcon = (tx) => {
      return tx.isReward && (<span title="Reward Transaction">💎</span>)
    }

    return (
      <div className="animated fadeIn">
        <Table
          cols={this.state.cols}
          data={this.props.txs.map(tx => ({
            ...tx,
            inputs: <Link to={`/tx/${tx.txId}`}>{tx.countIn}</Link>,
            outputs: <Link to={`/tx/${tx.txId}`}>{tx.countOut}</Link>,
            txId: <Link to={`/tx/${tx.txId}`}>{tx.txId}{getTxIcon(tx)}</Link>,
            value: <Link to={`/tx/${tx.txId}`}>{numeral(tx.amountOut).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}</Link>
          }))} />
      </div>
    );
  };
}
