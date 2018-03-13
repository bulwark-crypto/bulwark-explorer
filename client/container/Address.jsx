
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardAddress from '../component/Card/CardAddress';
import CardAddressTXs from '../component/Card/CardAddressTXs';
import HorizontalRule from '../component/HorizontalRule';

class Address extends Component {
  static propTypes = {
    getAddress: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      error: null,
      txs: []
    };
  };

  componentDidMount() {
    this.getAddress();
  };

  componentDidUpdate() {
    if (this.state.address !== this.props.match.params.hash) {
      this.getAddress();
    }
  };

  getAddress = () => {
    console.log(this.props.match.params.hash);
    this.props
      .getAddress(this.props.match.params.hash)
      .then(({ txs }) => this.setState({ txs, address: this.props.match.params.hash }))
      .catch(error => this.setState({ error }));
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    }

    return (
      <div>
        <HorizontalRule title="Wallet Info" />
        <CardAddress address={ this.state.address } txs={ this.state.txs } />
        <HorizontalRule title="Wallet Transactions" />
        <CardAddressTXs txs={ this.state.txs } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getAddress: query => Actions.getAddress(query)
});

const mapState = state => ({

});

export default connect(mapState, mapDispatch)(Address);
