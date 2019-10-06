
import Actions from '../core/Actions';
import Component from '../core/Component';
import throttle from '../../lib/throttle';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTXs from '../component/Card/CardTXs';
import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Select from '../component/Select';
import CardAddressTXs from '../component/Card/CardAddressTXs';

import { PAGINATION_PAGE_SIZE } from '../constants';

//@todo rename to AddressMovements
class AddressTxs extends Component {
  static propTypes = {
    getTXs: PropTypes.func.isRequired,
    //setTXs: PropTypes.func.isRequired,
    addressId: PropTypes.string.isRequired,
    txCount: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      movements: [],
      filter: localStorage.getItem('addressFilter') || null
    };

    //This is a new, better implementation of debouncing. The problem with old approach is that the initial request will be delayed by 800ms. 
    //First request should not be debounced, only actions after as majority of users will only view first page anyway, we need it to be as fast as possible;
    this.getThrottledTxs = throttle(() => {
      this.props
        .getTXs({
          addressId: this.props.addressId,
          limit: this.state.size,
          skip: (this.state.page - 1) * this.state.size,
          ...(this.state.filter ? { filter: this.state.filter } : null)
        })
        .then(({ pages, movements }) => {
          this.setState({ pages, movements, loading: false }, () => {
            // this.props.setTXs(movements); // Add this set of new txs to store
          });
        })
        .catch(error => this.setState({ error, loading: false }));
    }, 800);
  };

  componentDidMount() {
    this.getTXs();
  };

  componentWillUnmount() {
    if (this.throttledTxs) {
      clearTimeout(this.getThrottledTxs);
    }
  };

  getTXs = () => {
    this.setState({ loading: true }, () => {
      this.getThrottledTxs();
    });
  };

  handlePage = page => this.setState({ page }, this.getTXs);

  handleSize = size => this.setState({ size, page: 1 }, this.getTXs);


  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const paginationSelect = (
      <label>
        Per Page
        <Select
          onChange={value => this.handleSize(value)}
          selectedValue={this.state.size}
          options={selectOptions} />
      </label>
    );
    const getFilterSelect = () => {
      const addressFilters = [
        { value: 'all', label: 'All Transactions' },
        { value: 'excludeRewards', label: 'Exclude Rewards' }
      ];
      const handleAddressFilter = filter => {
        this.setState({ filter, page: 1 }, this.getTXs);
        localStorage.setItem('addressFilter', filter);
      };

      return (
        <label>
          Transactions Filter
        <Select
            onChange={value => handleAddressFilter(value)}
            selectedValue={this.state.filter}
            options={addressFilters} />
        </label>)
    };

    return (
      <div>
        <HorizontalRule
          selects={[getFilterSelect(), paginationSelect]}
          title={`Non-Reward Address Transactions (${this.props.txCount})`} />
        <CardAddressTXs movements={this.state.movements} addressId={this.props.addressId} />
        <Pagination
          current={this.state.page}
          className="float-right"
          onPage={this.handlePage}
          total={this.state.pages} />
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTXs: query => Actions.getMovements(null, query),
  //setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = state => ({
  tx: state.txs.length ? state.txs[0] : {}
});

export default connect(mapState, mapDispatch)(AddressTxs);
