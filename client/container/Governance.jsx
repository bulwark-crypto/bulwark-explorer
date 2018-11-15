
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { dateFormat } from '../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import sortBy from 'lodash/sortBy';

import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Table from '../component/Table';
import Select from '../component/Select';

import { PAGINATION_PAGE_SIZE } from '../constants';

class Governance extends Component {
  static propTypes = {
    getPPs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      cols: [
        { key: 'name', title: 'Name' },
        { key: 'created', title: 'Date' },
        { key: 'budgetTotal', title: 'Budget' },
        { key: 'status', title: 'Funded' }
      ],
      error: null,
      loading: true,
      pps: [] ,
      pages: 0,
      page: 1,
      size: 10
    };
  };

  componentDidMount() {
    this.getPPs();
  };

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };

  getPPs = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getPPs({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ pps, pages }) => {
            if (this.debounce) {
              this.setState({ pps, pages, loading: false });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
    });
  };

  handlePage = page => this.setState({ page }, this.getPPs);

  handleSize = size => this.setState({ size, page: 1 }, this.getPPs);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={ value => this.handleSize(value) }
        selectedValue={ this.state.size }
        options={ selectOptions } />
    );

    return (
      <div>
        <HorizontalRule
          select={ select }
          title="Current Proposals" />
        <Table
          cols={ this.state.cols }
          data={ sortBy(this.state.pps.map((pp) => {
            const created = moment(pp.created).utc();
            const isEpoch = created.unix() === 0;

            return {
              ...pp,
              name: pp.name,
              budgetTotal: pp.budgetTotal,
              status: pp.status
            };
          }), ['status']) } />
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
  getPPs: query => Actions.getPPs(query)
});

export default connect(null, mapDispatch)(Masternode);
