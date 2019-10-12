
import Actions from '../../core/Actions';
import Component from '../../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTXs from '../../component/Card/CardTXs';
import HorizontalRule from '../../component/HorizontalRule';
import Pagination from '../../component/Pagination';
import Select from '../../component/Select';
import CardAddressTXs from '../../component/Card/CardAddressTXs';

import { PAGINATION_PAGE_SIZE } from '../../constants';

//@todo rename to AddressMovements
class SocialFeed extends Component {
  static propTypes = {
    getSocial: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
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
      filter: localStorage.getItem('socialFilter') || null
    };

  };

  componentDidMount() {
    this.getSocial();
  };

  getSocial = () => {
    this.props.getSocial({
      //addressId: this.props.addressId,
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
  };

  handlePage = page => this.setState({ page }, this.getSocial);

  handleSize = size => this.setState({ size, page: 1 }, this.getSocial);


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
        { value: 'reddit', label: 'Reddit' },
      ];
      const handleAddressFilter = filter => {
        this.setState({ filter, page: 1 }, this.getSocial);
        localStorage.setItem('socialFilter', filter);
      };

      return (
        <label>
          Source Filter
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
          title={`${this.props.title} (${this.props.txCount})`} />
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
  getSocial: query => Actions.getSocial(query),
  //setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = state => ({
});

export default connect(mapState, mapDispatch)(SocialFeed);
