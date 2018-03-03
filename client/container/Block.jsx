
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';

class Block extends Component {
  static propTypes = {
    getBlock: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { block: {}, txs: [] };
  };

  componentDidMount() {
    this.props
      .getBlock(this.props.match.params.hash)
      .then(({ block, txs }) => this.setState({ block, txs }));
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Block Info" />
        <div className="card__row">
          <span className="card__label">Height:</span>
          <span className="card__result card__result--status">
            { this.state.block.height }
          </span>
        </div>
        
        <HorizontalRule title="Block Transactions" />
          
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getBlock: query => Actions.getBlock(query)
});

export default connect(null, mapDispatch)(Block);
