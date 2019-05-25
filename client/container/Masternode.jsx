import Actions from '../core/Actions';
import Component from '../core/Component';
import MasternodesList from '../component/MasternodesList';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Masternode extends Component {
  static propTypes = {
    getMNs: PropTypes.func.isRequired
  };
  render() {
    return (
      <MasternodesList getMNs= { this.props.getMNs } />
    );
  };
}

const mapDispatch = dispatch => ({
  getMNs: query => Actions.getMNs(query)
});

export default connect(null, mapDispatch)(Masternode);