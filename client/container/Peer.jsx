
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';

class Peer extends Component {
  static propTypes = {
    getPeers: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'ip', title: 'Address' },
        { key: 'ver', title: 'Protocol' },
        { key: 'subver', title: 'Sub-version' },
        { key: 'country', title: 'Country' },
      ],
      peers: []
    };
  };

  componentDidMount() {
    this.props.getPeers().then(peers => this.setState({ peers }));
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Connections" />
        <Table
          cols={ this.state.cols }
          data={ this.state.peers } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getPeers: () => Actions.getPeers()
});

export default connect(null, mapDispatch)(Peer);
