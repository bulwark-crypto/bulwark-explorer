import Component from '../core/Component';
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
    this.debounce = null;
    this.state = {
      cols: [
        { key: 'lastPaidAt', title: 'Last Paid' },
        { key: 'active', title: 'Active' },
        { key: 'addr', title: 'Address' },
        { key: 'txHash', title: 'Collateral TX' },
        { key: 'txOutIdx', title: 'Index' },
        { key: 'ver', title: 'Version' },
        { key: 'status', title: 'Status' },
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
  };

  componentDidMount() {
    this.getMNs();
  };

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };

  getMNs = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getMNs({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ mns, pages }) => {
            if (this.debounce) {
              this.setState({ mns, pages, loading: false });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
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
        <Select
          onChange={value => this.handleSize(value)}
          selectedValue={this.state.size}
          options={selectOptions} />
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
          select={getPaginationDropdown()}
          title={this.props.title} />
        <Table
          cols={this.state.cols}
          data={sortBy(this.state.mns.map((mn) => {
            const lastPaidAt = moment(mn.lastPaidAt).utc();
            const isEpoch = lastPaidAt.unix() === 0;

            return {
              ...mn,
              active: moment().subtract(mn.active, 'seconds').utc().fromNow(),
              addr: (
                <Link to={`/address/${mn.addr}`}>
                  {`${mn.addr.substr(0, 20)}...`}
                </Link>
              ),
              lastPaidAt: isEpoch ? 'N/A' : lastPaidAt.fromNow(),
              txHash: (
                <Link to={`/tx/${mn.txHash}`}>
                  {`${mn.txHash.substr(0, 20)}...`}
                </Link>
              ),
              status: (
                <span className="text-nowrap">
                  {getIcon(mn)}
                  {mn.status}
                </span>
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