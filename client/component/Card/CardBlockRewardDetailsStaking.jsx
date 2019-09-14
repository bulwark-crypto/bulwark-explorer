import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import config from '../../../config'
import PosProfitabilityScore from '../PosProfitabilityScore'
import PosRestakeIndicator from '../../component/FormattedValues/PosRestakeIndicator'

export default class CardBlockRewardDetailsStaking extends Component {
  static propTypes = {
    tx: PropTypes.object.isRequired
  };

  getBlockRewardLink(reward) {
    const posRestakeIndicator = <PosRestakeIndicator reward={reward} includeShortName={true} showStakeRewardAmount={true} />;

    // Link to the previous stake if this is a restake
    //@todo re-enable once we store the txid of input
    if (false && reward.stake.input.isRestake) {
      return (
        <Link to={`/tx/${reward.stake.input.txId}`}>
          {posRestakeIndicator}
        </Link>
      );
    }

    return posRestakeIndicator;
  }

  render() {
    // Ensure this reward transaction has new blockRewardDetails data (for backwards compatability)
    if (this.props.tx.isReward && !this.props.tx.blockRewardDetails) {
      return null;
    }

    const blockRewardDetails = this.props.tx.blockRewardDetails;

    const inputAgeDays = (blockRewardDetails.stake.ageTime / 1000 / 60 / 60 / 24).toFixed(2);
    const inputConfirmations = blockRewardDetails.stake.ageBlocks;

    return (
      <div className="animated fadeIn">
        <div className="card--block">
          <div className="card__row">
            <span className="card__label">Stake Input Amount:</span>
            <span className="card__result">{numeral(blockRewardDetails.stake.input.value).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}</span>
          </div>
          <div className="card__row">
            <span className="card__label">Stake Reward:</span>
            <span className="card__result">
              {this.getBlockRewardLink(blockRewardDetails)}
            </span>
          </div>
          <div className="card__row">
            <span className="card__label">Stake Input Age:</span>
            <span className="card__result">{inputAgeDays} Days</span>
          </div>
          <div className="card__row">
            <span className="card__label">Stake Input Confirmations:</span>
            <span className="card__result">{inputConfirmations}</span>
          </div>
          <div className="card__row">
            <span className="card__label">POS Stake ROI%:</span>
            <span className="card__result">
              <Link to={"/rewards"}>
                <PosProfitabilityScore reward={this.props.tx.blockRewardDetails} />
              </Link>
            </span>
          </div>

          <div className="card__row mt-3">
            <span className="card__label">Staking Address:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.stake.addressLabel}`}>{blockRewardDetails.stake.addressLabel}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Address Stake Count:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.stake.addressLabel}`}>{blockRewardDetails.stake.rewardsCarverAddress.countOut}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Address Stake Rewards:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.stake.addressLabel}`}>{numeral(blockRewardDetails.stake.rewardsCarverAddress.valueOut).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}</Link></span>
          </div>
        </div>
      </div>
    );
  };
}