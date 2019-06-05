
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'

import Table from '../Table';
import PosProfitabilityScore from '../PosProfitabilityScore';

export default class CardRewards extends Component {
  static defaultProps = {
    rewards: [],
    addBadgeClassToValue: true
  };

  static propTypes = {
    rewards: PropTypes.array.isRequired,
    addBadgeClassToValue: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      cols: [
        { key: 'blockHeight', title: 'Block #' },
        { key: 'posInputSizeAddress', title: 'Input Size' },
        { key: 'posInputConfirmations', title: 'Confirmations' },
        { key: 'computedProfitabilityScore', title: 'POS Profitability Score' },
        { key: 'date', title: 'Created' },

        // Optional columns we could enable:
        //{ key: 'posReward', title: 'POS Reward' },
        //{ key: 'masternodeAddress', title: 'MN Address' },
        //{ key: 'masternodeReward', title: 'MN Reward' },
      ]
    };
  };
  formatAmount(amountToFormat) {
    const amountFormatted = (numeral(amountToFormat).format(config.coinDetails.coinNumberFormat));

    return amountFormatted;
  }


  getTableData() {
    return this.props.rewards.map(reward => {
      const date = moment(reward.date).utc();
      const diffSeconds = moment().utc().diff(date, 'seconds');

      return ({
        ...reward,
        blockHeight: (
          <Link to={`/tx/${reward.stake.input.txId}`}>
            {reward.blockHeight}
          </Link>
        ),
        posInputSizeAddress: (
          <Link to={`/tx/${reward.stake.input.txId}`}>
            {this.formatAmount(reward.stake.input.value)}
          </Link>
        ),
        posInputConfirmations: (
          <Link to={`/tx/${reward.stake.input.txId}`}>
            {reward.stake.input.confirmations}
          </Link>
        ),
        date: (
          <Link to={`/tx/${reward.stake.input.txId}`}>
            {dateFormat(reward.date)} ({diffSeconds < 60 ? `${diffSeconds} seconds` : date.fromNow(true)})
          </Link>
        ),
        computedProfitabilityScore: (
          <Link to={`/tx/${reward.stake.input.txId}`}>
            <PosProfitabilityScore reward={reward} />
          </Link>
        ),
        // Optional columns we could enable:
        /*
        masternodeAddress: (
          <Link to={`/block/${reward.blockHeight}`}>
            {reward.masternode.address}
          </Link>
        ),*/
        /*
        posAddress: (
          <Link to={`/block/${reward.blockHeight}`}>
            {reward.stake.address}
          </Link>
        ),
        masternodeReward: (
          <Link to={`/block/${reward.blockHeight}`}>
            {this.formatAmount(reward.masternode.reward)}
          </Link>
        ),
        masternodeAddress: (
          <Link to={`/block/${reward.blockHeight}`}>
            {reward.masternode.address}
          </Link>
        ),
        posReward: (
          <Link to={`/block/${reward.blockHeight}`}>
            {this.formatAmount(reward.stake.reward)}
          </Link>
        ),
        */
      });
    })
  }

  render() {
    return (
      <Table
        cols={this.state.cols}
        data={this.getTableData()} />
    );
  };
}
