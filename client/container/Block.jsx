
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardBlock from '../component/Card/CardBlock';
import CardBlockTXs from '../component/Card/CardBlockTXs';
import HorizontalRule from '../component/HorizontalRule';

class Block extends Component {
  static propTypes = {
    getBlock: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      block: {},
      loading: true,
      error: null,
      txs: []
    };
  };

  componentDidMount() {
    this.getBlock();
  };

  componentDidUpdate(prevProps) {
    const { params: { hash } } = this.props.match;
    if (prevProps.match.params.hash !== hash && !this.state.loading) {
      this.getBlock();
    }
  };

  getBlock = () => {
    this.setState({ loading: true }, () => {
      this.props
        .getBlock(this.props.match.params.hash)
        .then(({ block, txs }) => {
          this.setState({ block, txs, loading: false });
        })
        .catch(error => this.setState({ error, loading: false }));
    });
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }

    return (
      <div>
        <HorizontalRule title="Block Info" />
        <CardBlock block={ this.state.block } height={ this.props.tx.blockHeight } />
        <HorizontalRule title="Block Transactions" />
        <CardBlockTXs txs={ this.state.txs } />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getBlock: query => Actions.getBlock(query)
});

const mapState = state => ({
  tx: state.txs.length
    ? state.txs[0]
    : { blockHeight: state.coin.blocks }
});

export default connect(mapState, mapDispatch)(Block);
