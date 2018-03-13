
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardAddress from '../component/Card/CardAddress';
import CardAddressTXs from '../component/Card/CardAddressTXs';
import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';

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
      pages: 0,
      page: 1,
      size: 10,
      txs: []
    };
  };

  componentDidMount() {
    this.getAddress();
  };

  componentDidUpdate() {
    if (!!this.state.address
      && this.state.address !== this.props.match.params.hash) {
      this.getAddress();
    }
  };

  getAddress = () => {
    const address = this.props.match.params.hash;
    this.props
      .getAddress({
        address,
        limit: this.state.size,
        skip: (this.state.page - 1) * this.state.size
      })
      .then(txs => this.setState({ address, txs }))
      .catch(error => this.setState({ error }));
  };

  handlePage = page => this.setState({ page }, this.getAddress);

  handleSize = size => this.setState({ size, page: 1 }, this.getAddress);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    }

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
        <HorizontalRule title="Wallet Info" />
        <CardAddress address={ this.state.address } txs={ this.state.txs } />
        <HorizontalRule select={ select } title="Wallet Transactions" />
        <CardAddressTXs address={ this.state.address } txs={ this.state.txs } />
        <Pagination
          current={ this.state.page }
          className="float-right"
          onPage={ this.handlePage }
          total={ this.state.pages } />
        <div className="clearfix" />
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
