
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

import SocialFeed from '../component/Social/SocialFeed'

class Overview extends Component {
  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      cols: [
        { title: 'Height', key: 'blockHeight' },
        { title: 'Transaction Hash', key: 'label' },
        { title: 'Value', key: 'valueOut' },
        { title: 'Sources', key: 'countIn' },
        { title: 'Recepients', key: 'countOut' },
        { title: 'Created', key: 'date' },
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
          <Link to={`/tx/${tx.txId}`}>
            {tx.txId}
          </Link>
        ),
        valueOut: (
          <Link to={`/tx/${tx.txId}`}>
            {TransactionValue(tx, tx.amountOut)}
          </Link>
        ),
        countIn: (
          <Link to={`/tx/${tx.txId}`}>
            {tx.addressesIn}
          </Link>
        ),
        countOut: (
          <Link to={`/tx/${tx.txId}`}>
            {tx.addressesOut}
          </Link>
        ),
        date: (
          <Link to={`/tx/${tx.txId}`} className="text-nowrap">
            {dateFormat(tx.date)} ({diffSeconds < 60 ? `${diffSeconds} seconds` : date.fromNow(true)})
          </Link>
        ),
      });
    });

    const getLatestTxs = () => {
      return (<div><HorizontalRule title="Latest Non-Reward Transactions" />
        <Table
          cols={this.state.cols}
          data={txs} /></div>)
    }

    const getSocialFeed = () => {
      return (<div>
        <SocialFeed title="Latest Development Updates" />
      </div>)
    }

    return (
      <div>
        {getSocialFeed()}
        {/*getLatestTxs()*/}
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
