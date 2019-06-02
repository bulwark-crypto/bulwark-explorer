
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { dateFormat } from '../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';
import TransactionValue from '../component/Table/TransactionValue';

class Overview extends Component {
  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      cols: [
        {title: 'Height', key: 'blockHeight'},
        {title: 'Transaction Hash', key: 'txId'},
        {title: 'Value', key: 'vout'},
        {title: 'Inputs', key: 'inputs'},
        {title: 'Outputs', key: 'outputs'},
        {title: 'Created', key: 'createdAt'},
      ]
    };
  };

  render() {
    // Setup the list of transactions with age since created.
    const txs = this.props.txs.map(tx => {
      const createdAt = moment(tx.createdAt).utc();
      const diffSeconds = moment().utc().diff(createdAt, 'seconds');
      let blockValue = 0.0;
      if (tx.vout && tx.vout.length) {
        tx.vout.forEach(vout => blockValue += vout.value);
      }

      return ({
        ...tx,
        blockHeight: (
          <Link to={`/block/${tx.blockHeight}`}>
            {tx.blockHeight}
          </Link>
        ),
        txId: (
          <Link to={`/tx/${tx.txId}`}>
            {tx.txId}
          </Link>
        ),
        vout: (
          <Link to={`/tx/${tx.txId}`}>
            {TransactionValue(tx, blockValue)}
          </Link>
        ),
        inputs: (
          <Link to={`/tx/${tx.txId}`}>
            {tx.vin.length}
          </Link>
        ),
        outputs: (
          <Link to={`/tx/${tx.txId}`}>
            {tx.vout.length}
          </Link>
        ),
        createdAt: (
          <Link to={`/tx/${tx.txId}`} className="test">
            {dateFormat(tx.createdAt)} ({diffSeconds < 60 ? `${diffSeconds} seconds` : createdAt.fromNow(true)})
          </Link>
        ),
      });
    });

    return (
      <div>
        <HorizontalRule title="Latest Blocks" />
        <Table
          cols={ this.state.cols }
          data={ txs } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({

});

const mapState = state => ({
  txs: state.txs.filter((tx, index) => index < 10) // Only take first 10 items from txs
});

export default connect(mapState, mapDispatch)(Overview);
