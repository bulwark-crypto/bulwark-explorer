
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTXs from '../component/Card/CardTXs';
import HorizontalRule from '../component/HorizontalRule';

class Movement extends Component {
  static propTypes = {
    getTXs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { 
      page: 1,
      size: 10, 
      txs: [] 
    };
  };

  componentDidMount() {
    this.props
      .getTXs({ 
        limit: this.state.size, 
        skip: (this.state.page - 1) * this.state.size 
      })
      .then(txs => this.setState({ txs }));
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Movement" />
        <CardTXs txs={ this.state.txs } /> 
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTXs: query => Actions.getTXLatest(null, query)
});

export default connect(null, mapDispatch)(Movement);
