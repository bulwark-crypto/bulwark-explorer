import Actions from '../core/Actions';
import Component from '../core/Component';
import throttle from '../../lib/throttle';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardRewards from '../component/Card/CardRewards';
import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Select from '../component/Select';
import ChartComponent from '../component/ChartComponent'
import { TimeIntervalType } from '../../lib/timeInterval'

import { PAGINATION_PAGE_SIZE } from '../constants';

class Rewards extends Component {
  static propTypes = {
    getRewards: PropTypes.func.isRequired,
    //@todo rewards: PropTypes.object.isRequired //@todo accept rewards from store & write to store with updated block reward data
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      rewards: []
    };

    this.getThrottledRewards = throttle(() => {
      this.props
        .getRewards({
          limit: this.state.size,
          skip: (this.state.page - 1) * this.state.size
        })
        .then(({ pages, rewards }) => {
          this.setState({ pages, rewards, loading: false }, () => {
            //this.props.setRewards(rewards); //@todo
          });
        })
        .catch(error => this.setState({ error, loading: false }));
    }, 800);

  };



  componentDidMount() {
    this.getRewards();
  };

  componentWillUnmount() {
    if (this.throttledTxs) {
      clearTimeout(this.getThrottledRewards);
    }
  };

  getRewards = () => {
    this.setState({ loading: true }, () => {
      this.getThrottledRewards();
    });
  };

  handlePage = page => this.setState({ page }, this.getThrottledRewards);

  handleSize = size => this.setState({ size, page: 1 }, this.getThrottledRewards);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={value => this.handleSize(value)}
        selectedValue={this.state.size}
        options={selectOptions} />
    );


    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-lg-6">
            <HorizontalRule
              title="Average POS Input Size" />
            <ChartComponent type={TimeIntervalType.DailyAvgPosInputValue} />
          </div>
          <div className="col-md-12 col-lg-6">
            <HorizontalRule
              title="Average Daily POS ROI%" />
            <ChartComponent type={TimeIntervalType.DailyAvgPosRoi} />
          </div>
        </div>

        <HorizontalRule
          select={select}
          title="Proof Of Stake Rewards" />
        <CardRewards rewards={this.state.rewards} addBadgeClassToValue={false} />
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
  getRewards: query => Actions.getRewards(null, query),
  //setRewards: txs => Actions.setRewards(dispatch, rewards) //@todo
});

const mapState = state => ({
  //rewards: //@todo
});

export default connect(mapState, mapDispatch)(Rewards);