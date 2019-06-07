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
    const posRestakeIndicator = <PosRestakeIndicator reward={reward} includeShortName={true} />;
    
    // Link to the previous stake if this is a restake
    if (reward.stake.input.isRestake) {
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

    const inputAgeHours = (blockRewardDetails.stake.input.age / 60 / 60).toFixed(2);
    const inputConfirmations = blockRewardDetails.stake.input.confirmations;

    return (
      <div className="animated fadeIn">
        <div className="card--block">
          <div className="card__row">
            <span className="card__label">Staking Address:</span>
            <span className="card__result"><Link to={`/address/${blockRewardDetails.stake.address}`}>{blockRewardDetails.stake.address}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Stake Reward:</span>
            <span className="card__result">
              {this.getBlockRewardLink(blockRewardDetails)}
            </span>
          </div>
          <div className="card__row">
            <span className="card__label">Stake Input Age:</span>
            <span className="card__result">{inputAgeHours} Hours</span>
          </div>
          <div className="card__row">
            <span className="card__label">Stake Input Confirmations:</span>
            <span className="card__result">{inputConfirmations}</span>
          </div>
          <div className="card__row">
            <span className="card__label">POS Profitability Score:</span>
            <span className="card__result">
              <Link to={"/rewards"}>
                <PosProfitabilityScore reward={this.props.tx.blockRewardDetails} />
              </Link>
            </span>
          </div>
        </div>
      </div>
    );
  };
}