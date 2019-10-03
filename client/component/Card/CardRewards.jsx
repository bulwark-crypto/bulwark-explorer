
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'
import Icon from '../Icon'

import Table from '../Table';
import PosProfitabilityScore from '../PosProfitabilityScore';
import PosRestakeIndicator from '../FormattedValues/PosRestakeIndicator'

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
        { key: 'posInputAmount', title: 'Input Size' },
        { key: 'posInputConfirmations', title: 'Confirmations' },
        { key: 'posStakeRoi', title: 'POS Stake ROI%' },
        { key: 'masternodeRoi', title: 'MN ROI%' },
        { key: 'date', title: 'Created' },

        // Optional columns we could enable:
        //{ key: 'posReward', title: 'POS Reward' },
        //{ key: 'masternodeAddress', title: 'MN Address' },
        //{ key: 'masternodeReward', title: 'MN Reward' },
      ]
    };
  };

  getRewardLink(reward) {
    // By default go to the tx that was stake's input
    return `/tx/${reward.txId}`;
  }

  getTableData() {
    return this.props.rewards.map(reward => {
      const date = moment(reward.date).utc();
      const diffSeconds = moment().utc().diff(date, 'seconds');
      const getPosInputConfirmations = () => {
        if (!reward.stake) {
          return null;
        }
        return reward.stake.ageBlocks;
      }

      return ({
        ...reward,
        blockHeight: (
          <Link to={this.getRewardLink(reward)}>
            {reward.blockHeight}
          </Link>
        ),
        posInputAmount: (
          <Link to={this.getRewardLink(reward)}>
            <PosRestakeIndicator reward={reward} />
          </Link>
        ),
        posInputConfirmations: (
          <Link to={this.getRewardLink(reward)}>
            {getPosInputConfirmations()}
          </Link>
        ),
        posStakeRoi: (
          <Link to={this.getRewardLink(reward)}>
            <PosProfitabilityScore reward={reward} />
          </Link>
        ),
        masternodeRoi: (
          <Link to={this.getRewardLink(reward)}>
            {reward.masternode ? `${reward.masternode.roi.toFixed(2)}%` : ''}
          </Link>
        ),
        date: (
          <Link to={this.getRewardLink(reward)} className="text-nowrap">
            {dateFormat(reward.date)} ({diffSeconds < 60 ? `${diffSeconds} seconds` : date.fromNow(true)})
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
