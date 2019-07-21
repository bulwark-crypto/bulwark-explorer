
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
        { key: 'inputs', title: 'Inputs' },
        { key: 'outputs', title: 'Outputs' },
        { key: 'value', title: 'Value' },
      ]
    };
  };

  render() {
    return (
      <div className="animated fadeIn">
        <Table
          cols={this.state.cols}
          data={this.props.txs.map(tx => ({
            ...tx,
            inputs: (tx.countIn),
            outputs: (tx.countOut),
            txId: (
              <Link to={`/tx/${tx.label}`}>{tx.label}</Link>
            ),
            value: (
              <span>{numeral(tx.valueOut).format(config.coinDetails.coinNumberFormat)}</span>
            )
          }))} />
      </div>
    );
  };
}
