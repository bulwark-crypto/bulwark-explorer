import React from 'react';
import numeral from 'numeral';
import Icon from '../Icon';
import config from '../../../config'

/**
 * Adds ability to format a transaction value
 */
const PosRestakeIndicator = ({ reward, includeShortName = false, showStakeRewardAmount = false }) => {

  const getRestakeIcon = (reward) => {
    if (reward.stake.input.isRestake) {
      return null;
    }
    return <Icon name="recycle" className="fas pl-1 text-primary align-middle" />;
  }

  const getTitle = (reward) => {
    if (reward.stake.input.isRestake) {
      return null;
    }
    return "Restake (Stake of Previously Staked Output)";
  }

  const formatAmount = (amountToFormat) => {
    const amountFormatted = (numeral(amountToFormat).format(config.coinDetails.coinNumberFormat)); //@todo We really need to move all of these formattings into a single component

    if (includeShortName) {
      return `${amountFormatted} ${config.coinDetails.shortName}`;
    }

    return amountFormatted;
  }
  if (!reward.stake) {
    return null;
  }

  let amount = reward.stake.input.value;
  if (showStakeRewardAmount) {
    amount = reward.stake.reward;
  }

  return (
    <span title={getTitle(reward)}>
      {formatAmount(amount)}{getRestakeIcon(reward)}
    </span>
  );
}

export default PosRestakeIndicator;