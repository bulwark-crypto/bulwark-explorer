
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
        {title: 'Transaction Hash', key: 'label'},
        {title: 'Value', key: 'valueOut'},
        {title: 'Inputs', key: 'countIn'},
        {title: 'Outputs', key: 'countOut'},
        {title: 'Created', key: 'date'},
      ]
    };
  };

  render() {
    // Setup the list of transactions with age since created.
    const txs = this.props.txs.map(tx => {
      const date = moment(tx.date).utc();
      const diffSeconds = moment().utc().diff(date, 'seconds');

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
          <Link to={`/tx/${tx.label}`}>
            {TransactionValue(tx, tx.valueOut)}
          </Link>
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
          <Link to={`/tx/${tx.label}`} className="text-nowrap">
            {dateFormat(tx.date)} ({diffSeconds < 60 ? `${diffSeconds} seconds` : date.fromNow(true)})
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
