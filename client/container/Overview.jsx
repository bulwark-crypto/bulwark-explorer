
import Actions from 'core/Actions';
import Component from 'core/Component';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import CoinSummary from 'component/CoinSummary';
import HorizontalRule from 'component/HorizontalRule';
import SearchBar from 'component/SearchBar';
import Table from 'component/Table';

class Overview extends Component {
  static propTypes = {
    getLatest: PropTypes.func.isRequired,
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      cols: [
        'height',
        {title: 'Transaction Hash', key: 'hash'},
        'age',
        'vout',
        'recipients',
        'createdAt'],
      limit: 10
    };
    this.timeout = null;
  };

  componentDidMount() {
    this.props
      .getLatest({ limit: this.state.limit })
      .then(this.getLatest)
      .catch(this.getLatest);
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  };

  getLatest = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.props
        .getLatest({ limit: this.state.limit })
        .then(this.getLatest)
        .catch(this.getLatest);
    }, 30000); // 30 seconds
  };

  render() {
    // Setup the list of transactions with age since created.
    const txs = this.props.txs.map(tx => ({
      ...tx,
      age: moment(tx.createdAt).fromNow(),
      createdAt: moment(tx.createdAt).format('MM/DD/YYYY hh:mm A'),
      vout: tx.vout.toFixed(8)
    }));

    return (
      <div>
        <SearchBar />
        <CoinSummary />
        <HorizontalRule title="Latest Transactions" />
        <Table
          cols={ this.state.cols }
          data={ txs } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getLatest: query => Actions.getTXLatest(dispatch, query)
});

const mapState = state => ({
  txs: state.txs
});

export default connect(mapState, mapDispatch)(Overview);
