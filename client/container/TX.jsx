
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
    setTXs: PropTypes.func.isRequired,
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

    // Try to get this TX from redux store, if it doesn't exist
    if ((!this.props.txFromStore && !this.state.tx || !!this.state.tx.txId && hash !== this.state.tx.txId) && !this.state.loading) {
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
    const txId = this.props.match.params.hash;
    this.setState({ loading: true }, () => {
      this.props
        .getTX(txId)
        .then(tx => {
          this.setState({ tx, loading: false });
          this.props.setTXs([tx]); // Add this new tx to store so we don't have to reload it later on
        })
        .catch(error => this.setState({ error, tx: { txId }, loading: false })); // Notice how we set tx.txId so we know current url already tried to getTx() and won't retry on failure
    });
  }

  getTransactionDetails() {
    return (
      <div className="row">
        <div className="col">
          <HorizontalRule title="Inputs" />
          <CardTXIn txs={this.state.tx.vin} />
        </div>
        <div className="col">
          <HorizontalRule title="Outputs" />
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
  getTX: query => Actions.getTX(query),
  setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = (state, ownProps) => {
  // Try to fetch transaction from store, if it exists we don't need to reload it
  const txForHashFromStore = state.txs.find(tx => tx.txId == ownProps.match.params.hash);

  return {
    txFromStore: txForHashFromStore,
  };
};

export default connect(mapState, mapDispatch)(TX);
