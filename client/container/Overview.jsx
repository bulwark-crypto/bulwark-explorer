
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';

class Overview extends Component {
  static propTypes = {
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
        'createdAt']
    };
  };

  render() {
    // Setup the list of transactions with age since created.
    const txs = this.props.txs.map(tx => ({
      ...tx,
      age: moment(tx.createdAt).fromNow(),
      createdAt: moment(tx.createdAt).format('MM/DD/YYYY hh:mm A'),
      hash: (<Link to={ `/tx/${ tx.hash }` }>{ tx.hash }</Link>),
      height: (<Link to={ `/block/${ tx.height }` }>{ tx.height }</Link>),
      vout: tx.vout.toFixed(8)
    }));

    return (
      <div>
        <HorizontalRule title="Latest Transactions" />
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
  txs: state.txs
});

export default connect(mapState, mapDispatch)(Overview);
