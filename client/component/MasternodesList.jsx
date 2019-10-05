import Component from '../core/Component';
import throttle from '../../lib/throttle';
import numeral from 'numeral';
import config from '../../config'
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
import Icon from '../component/Icon';

import { PAGINATION_PAGE_SIZE } from '../constants';

class MasternodesList extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    getMNs: PropTypes.func.isRequired,
    isPaginationEnabled: PropTypes.bool.isRequired,
    hideCols: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      cols: [
        { key: 'lastPaidAt', title: 'Last Paid' },
        { key: 'addr', title: 'Address' },
        { key: 'activeMns', title: 'Masternodes' },
        { key: 'created', title: 'Created' },
        //{ key: 'txHash', title: 'Collateral TX' },
        //{ key: 'txOutIdx', title: 'Index' },
        //{ key: 'ver', title: 'Version' },
        //{ key: 'status', title: 'Status' },
        { key: 'rewardsCount', title: 'Rewards Count' },
        { key: 'totalRewards', title: 'Total Rewards' },
      ],
      error: null,
      loading: true,
      mns: [],
      pages: 0,
      page: 1,
      size: 10
    };

    // You can optionally pass in array of columns to hide in masternodes table
    if (!!this.props.hideCols) {
      this.state.cols = this.state.cols.filter((value) => {
        return !this.props.hideCols.includes(value.key);
      });
    }

    this.getThrottledMns = throttle(() => {
      this.props
        .getMNs({
          limit: this.state.size,
          skip: (this.state.page - 1) * this.state.size,
          tag: this.props.tag
        })
        .then(({ mns, pages, total }) => {
          this.setState({
            mns,
            pages,
            loading: false,
            title: `Masternodes (${total} Since Genesis)`
          });
        })
        .catch(error => this.setState({ error, loading: false }));
    }, 800);
  };

  componentDidMount() {
    this.getMNs();
  };

  componentWillUnmount() {
    if (this.getThrottledMns) {
      clearTimeout(this.getThrottledMns);
    }
  };

  getMNs = () => {
    this.setState({ loading: true }, () => {
      this.getThrottledMns();
    });
  };

  handlePage = page => this.setState({ page }, this.getMNs);

  handleSize = size => this.setState({ size, page: 1 }, this.getMNs);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const getPaginationDropdown = () => {
      if (!this.props.isPaginationEnabled) {
        return null;
      }
      return (
        <label>
          Per Page
          <Select
            onChange={value => this.handleSize(value)}
            selectedValue={this.state.size}
            options={selectOptions} />
        </label>
      );
    };

    const getPaginationControls = () => {
      if (!this.props.isPaginationEnabled) {
        return null;
      }
      return (<Pagination
        current={this.state.page}
        className="float-right"
        onPage={this.handlePage}
        total={this.state.pages} />);
    }

    const getIcon = (mn) => {
      switch (mn.network) {
        case "onion":
          return (
            <span title="Onion Network"><Icon name="user-secret" className="pr-1 text-primary fa-lg" /></span>
          )
        case "ipv6":
          return (
            <span title="IPv6"><Icon name="desktop" className="pr-1 text-primary fa-lg" /></span>
          )
        default:
          return null;
      }
    }

    // Calculate the future so we can use it to
    // sort by lastPaid in descending order.
    const future = moment().add(2, 'years').utc().unix();

    return (
      <div>
        <HorizontalRule
          selects={[getPaginationDropdown()]}
          title={this.state.title} />
        <Table
          cols={this.state.cols}
          data={sortBy(this.state.mns.map((mn) => {
            const lastPaidAt = moment(mn.lastMovement.carverMovement.date).utc();
            const isEpoch = lastPaidAt.unix() === 0;

            const ageDays = moment(mn.lastMovement.carverMovement.date).utc().unix() - moment(mn.date).utc().unix();

            const mnAddress = mn.label.replace(':MN', ''); //Remove the :MN suffix from carver address

            return {
              ...mn,
              active: moment().subtract(mn.active, 'seconds').utc().fromNow(true),
              addr: (
                <Link to={`/address/${mnAddress}`}>
                  {mnAddress}
                </Link>
              ),
              created: (
                <Link to={`/address/${mnAddress}`} className="text-nowrap">
                  {moment(mn.date).utc().fromNow()}
                </Link>
              ),
              lastPaidAt: (
                <Link to={`/address/${mnAddress}`} className="text-nowrap">
                  {isEpoch ? 'N/A' : lastPaidAt.fromNow()}
                </Link>
              ),
              activeMns: (
                <Link to={`/address/${mnAddress}`}>
                  {`${mn.masternodesForAddress.length}`}
                </Link>
              ),

              rewardsCount: (
                <Link to={`/address/${mnAddress}`}>
                  {`${mn.countOut}`}
                </Link>
              ),
              totalRewards: (
                <Link to={`/address/${mnAddress}`}>
                  {numeral(mn.balance * -1).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
                </Link>
              )
            };
          }), ['status'])} />
        {getPaginationControls()}
        <div className="clearfix" />
      </div>
    );
  };
}

export default MasternodesList;