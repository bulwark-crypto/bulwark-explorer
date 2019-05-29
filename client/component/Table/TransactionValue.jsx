import React from 'react';
import numeral from 'numeral';
import Icon from '../Icon';

/**
 * Adds ability to format a transaction value
 */
const TransactionValue = (tx, blockValue) => {
  const formattedBlockValue = (numeral(blockValue).format('0,0.0000'));

  if (tx.isReward) {
    return (
      <span title="Block Reward for POS & Masternode">
        {formattedBlockValue}
        <Icon name="gem" className="far pl-1 text-primary" />
      </span>
    );
  }

  return formattedBlockValue;
}

export default TransactionValue;