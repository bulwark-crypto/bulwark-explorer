
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
      loading: true,
      peers: []
    };
  };

  componentDidMount() {
    this.props
      .getPeers()
      .then(peers => this.setState({ peers, loading: false }))
      .catch(error => this.setState({ error, loading: false }));
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }

    return (
      <div>
        <HorizontalRule title="Connections" />
        <Table
          cols={ this.state.cols }
          data={ this.state.peers.map(peer => ({
            ...peer,
            ip: (
              <div>
                <img
                  className="flag"
                  src={ `/img/flag/${ peer.countryCode ? peer.countryCode.toLowerCase() : 'xx' }.gif` }
                  title={ peer.country } /> { peer.ip }
              </div>
            )
          })) } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getPeers: () => Actions.getPeers()
});

export default connect(null, mapDispatch)(Peer);
