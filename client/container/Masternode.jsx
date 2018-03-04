
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
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
        { key: 'addr', title: 'Address' },
        { key: 'txhash', title: 'Transaction' },
        { key: 'txOutIdx', title: 'Index' },
        { key: 'version', title: 'Version' },
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
            ...mn
          })) } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getMNs: () => Actions.getMNs()
});

export default connect(null, mapDispatch)(Masternode);
