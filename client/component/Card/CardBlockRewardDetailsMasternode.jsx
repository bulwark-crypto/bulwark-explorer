import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import config from '../../../config'

export default class CardBlockRewardDetailsMasternode extends Component {
  static propTypes = {
    tx: PropTypes.object.isRequired
  };

  render() {
    // Ensure this reward transaction has new blockRewardDetails data (for backwards compatability)
    if (this.props.tx.isReward && !this.props.tx.blockRewardDetails) {
      return null;
    }

    const blockRewardDetails = this.props.tx.blockRewardDetails;
    const masternodeLifetimeRoi = (blockRewardDetails.masternode.rewardsCarverAddress.valueOut / config.coinDetails.masternodeCollateral) * 100;

    return (
      <div className="animated fadeIn">
        <div className="card--block">
          <div className="card__row">
            <span className="card__label">Masternode ROI%:</span>
            <span className="card__result">{numeral(blockRewardDetails.masternode.roi).format(config.coinDetails.coinNumberFormat)}% / year</span>
          </div>
          <div className="card__row">
            <span className="card__label">Masternode Reward:</span>
            <span className="card__result">{numeral(blockRewardDetails.masternode.reward).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}</span>
          </div>
          <div className="card__row mt-3">
            <span className="card__label">Masternode Address:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.masternode.addressLabel}`}>{blockRewardDetails.masternode.addressLabel}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Address Lifetime Count:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.masternode.addressLabel}`}>{blockRewardDetails.masternode.rewardsCarverAddress.countOut}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Address Lifetime Rewards:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.masternode.addressLabel}`}>{numeral(blockRewardDetails.masternode.rewardsCarverAddress.valueOut).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Masternode Return:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.masternode.addressLabel}`}>+{masternodeLifetimeRoi.toFixed(2)} %</Link></span>
          </div>
        </div>
      </div>
    );
  };
}