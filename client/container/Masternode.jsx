
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';

class Masternode extends Component {
  static propTypes = {
    getMNs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'lastPaidAt', title: 'Last Paid' },
        { key: 'active', title: 'Active Duration' },
        { key: 'addr', title: 'Address' },
        { key: 'txOutIdx', title: 'Index' },
        { key: 'ver', title: 'Version' },
        { key: 'status', title: 'Status' },
      ],
      mns: []
    };
  };

  componentDidMount() {
    this.props.getMNs().then(mns => this.setState({ mns }));
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Masternodes" />
        <Table
          cols={ this.state.cols }
          data={ this.state.mns.map(mn => ({
            ...mn,
            active: moment().subtract(mn.active, 'seconds').utc().fromNow(),
            lastPaidAt: moment(mn.lastPaidAt).utc().format('YYYY-MM-DD HH:MM A'),
            txHash: (
              <Link to={ `/tx/${ mn.txHash }` }>{ mn.txHash }</Link>
            )
          })) } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getMNs: () => Actions.getMNs()
});

export default connect(null, mapDispatch)(Masternode);
