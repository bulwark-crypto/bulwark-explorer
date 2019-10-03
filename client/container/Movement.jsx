
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
import { CarverMovementType } from '../../lib/carver2d'
import { TimeIntervalType } from '../../lib/timeInterval'

import ChartComponent from '../component/ChartComponent'
import { PAGINATION_PAGE_SIZE } from '../constants';

class Movement extends Component {
  static propTypes = {
    getTXs: PropTypes.func.isRequired,
    setTXs: PropTypes.func.isRequired,
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      total: 0,
      page: 1,
      size: 10,
      txs: [],
      sort: 'sequence',
      date: '0',
    };

    //This is a new, better implementation of debouncing. The problem with old approach is that the initial request will be delayed by 800ms. 
    //First request should not be debounced, only actions after as majority of users will only view first page anyway, we need it to be as fast as possible;
    this.getThrottledTxs = throttle(() => {
      this.props
        .getTXs({
          limit: this.state.size,
          skip: (this.state.page - 1) * this.state.size,
          sort: this.state.sort,
          date: this.state.date
        })
        .then(({ pages, txs, total }) => {
          this.setState({ pages, total, txs, loading: false }, () => {
            this.props.setTXs(txs); // Add this set of new txs to store
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

  handleSort = sort => this.setState({ sort, page: 1 }, this.getTXs);

  handleDate = date => this.setState({ date, page: 1 }, this.getTXs);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const getDateDropdown = () => {
      // Caver movement types
      const sortOptions = [
        { label: 'Since Genesis', value: '0' },

        { label: 'Last Hour', value: (60 * 60).toString() },
        { label: 'Last 2 Hours', value: (60 * 60 * 2).toString() },
        { label: 'Last 4 Hours', value: (60 * 60 * 4).toString() },
        { label: 'Last 8 Hours', value: (60 * 60 * 8).toString() },
        { label: 'Last 24 Hours', value: (60 * 60 * 24).toString() },
        { label: 'Last 48 Hours', value: (60 * 60 * 24 * 2).toString() },
        { label: 'Last Week', value: (60 * 60 * 24 * 7).toString() },
        { label: 'Last Month', value: (60 * 60 * 24 * 31).toString() },
        { label: 'Last Year', value: (60 * 60 * 24 * 365).toString() },
        { label: 'Last 2 Years', value: (60 * 60 * 24 * 365 * 2).toString() },
      ];
      return <label>
        Date Range
          <Select
          onChange={value => this.handleDate(value)}
          selectedValue={this.state.date}
          options={sortOptions} />
      </label>
    }
    const getFilterDropdown = () => {
      // Caver movement types
      const sortOptions = [
        { label: 'Date', value: 'sequence' },
        { label: 'Value', value: 'valueOut' },
      ];
      return <label>
        Sort By
          <Select
          onChange={value => this.handleSort(value)}
          selectedValue={this.state.sort}
          options={sortOptions} />
      </label>
    }
    const getPaginationDropdown = () => {
      return <label>
        Per Page
          <Select
          onChange={value => this.handleSize(value)}
          selectedValue={this.state.size}
          options={selectOptions} />
      </label>
    }



    return (
      <div>

        <HorizontalRule
          title="Daily Non-Reward Transactions Count" />
        <ChartComponent type={TimeIntervalType.DailyNonRewardTransactionsCount} />
        <HorizontalRule
          //dateSelect={getDateDropdown()} //@todo date-by-date range
          select={getPaginationDropdown()}
          //filterSelect={getFilterDropdown()}
          title={`Non-Reward Transactions (${this.state.total})`} />
        <CardTXs txs={this.state.txs} addBadgeClassToValue={false} />
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
  getTXs: query => Actions.getTXs(null, query),
  setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = state => ({
  tx: state.txs.length ? state.txs[0] : {}
});

export default connect(mapState, mapDispatch)(Movement);
