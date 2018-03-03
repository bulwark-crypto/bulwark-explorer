
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
    this.getTXs();
  };

  getTXs = () => {
    this.props
      .getTXs({ 
        limit: this.state.size, 
        skip: (this.state.page - 1) * this.state.size 
      })
      .then(({ pages, txs }) => this.setState({ pages, txs }));
  };

  handlePage = page => this.setState({ page }, this.getTXs);

  handleSize = size => this.setState({ size }, this.getTXs);

  render() {
    const select = (
      <select 
        onChange={ ev => this.handleSize(ev.target.value) }
        value={ this.state.size }>
        <option value={ 10 }>10</option>
        <option value={ 25 }>25</option>
        <option value={ 50 }>50</option>
      </select>
    );

    return (
      <div>
        <HorizontalRule 
          select={ select }
          title="Movement" />
        <CardTXs txs={ this.state.txs } /> 
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTXs: query => Actions.getTXs(null, query)
});

export default connect(null, mapDispatch)(Movement);
