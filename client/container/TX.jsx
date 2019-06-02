
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTX from '../component/Card/CardTX';
import CardBlockRewardDetailsMasternode from '../component/Card/CardBlockRewardDetailsMasternode';
import CardBlockRewardDetailsStaking from '../component/Card/CardBlockRewardDetailsStaking';
import CardTXIn from '../component/Card/CardTXIn';
import CardTXOut from '../component/Card/CardTXOut';
import HorizontalRule from '../component/HorizontalRule';

class TX extends Component {
  static propTypes = {
    getTX: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,

    // Props from mapState() below (only if available)
    txFromStore: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      tx: null
    };
  };

  componentDidMount() {
    this.getTX();
  }

  componentDidUpdate() {
    const { params: { hash } } = this.props.match;
    if ((!this.state.tx || !!this.state.tx.txId && hash !== this.state.tx.txId) && !this.state.loading) {
      this.getTX();
    }
  }

  getTransactionInfo() {
    return (
      <div>
        <HorizontalRule title="Transaction Info" />
        <CardTX height={this.state.tx.blockHeight} tx={this.state.tx} />
      </div>
    );
  }

  getBlockRewardDetails() {
    return (
      <div className="row">
        <div className="col">
          {this.getBlockRewardDetailsMasternode()}
        </div>
        <div className="col">
          {this.getBlockRewardDetailsStaking()}
        </div>
      </div>
    );
  }

  getBlockRewardDetailsMasternode() {
    if (!this.state.tx.isReward) {
      return null;
    }
    return (
      <div>
        <HorizontalRule title="Block Reward (Masternode)" />
        <CardBlockRewardDetailsMasternode tx={this.state.tx} />
      </div>
    );
  }

  getBlockRewardDetailsStaking() {
    if (!this.state.tx.isReward) {
      return null;
    }
    return (
      <div>
        <HorizontalRule title="Block Reward (POS)" />
        <CardBlockRewardDetailsStaking tx={this.state.tx} />
      </div>
    );
  }

  getTX() {
    if (this.props.txFromStore) {
      this.setState({ tx: this.props.txFromStore, loading: false });
      return;
    }
    this.setState({ loading: true }, () => {
      this.props
        .getTX(this.props.match.params.hash)
        .then(tx => {
          this.setState({ tx, loading: false });
        })
        .catch(error => this.setState({ error, loading: false }));
    });
  }

  getTransactionDetails() {
    return (
      <div className="row">
        <div className="col">
          <HorizontalRule title="Sending Addresses" />
          <CardTXIn txs={this.state.tx.vin} />
        </div>
        <div className="col">
          <HorizontalRule title="Recipients" />
          <CardTXOut txs={this.state.tx.vout} />
        </div>
      </div>
    );
  }

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }

    return (
      <div>
        {this.getTransactionInfo()}
        {this.getBlockRewardDetails()}
        {this.getTransactionDetails()}
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTX: query => Actions.getTX(query)
});

const mapState = (state, ownProps) => {
  // Try to fetch transaction from store, if it exists we don't need to reload it
  const txForHashFromStore = state.txs.find(tx => tx.txId == ownProps.match.params.hash);

  return {
    txFromStore: txForHashFromStore,
  };
};

export default connect(mapState, mapDispatch)(TX);
