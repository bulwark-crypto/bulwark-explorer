import React from 'react';
import config from '../../config'
import numeral from 'numeral';

/**
 * Take reward and format it into a profitability score
 * @todo move to FormattedValues folder
 */
const PosProfitabilityScore = ({ reward, includeTitle = true }) => {
  const getStyledProfitabilityScore = (profitabilityWeight) => {
    const weightColorScale = config.profitabilityScore.weightColorScale;
    const scores = config.profitabilityScore.scoreStyles;

    let profitabilityStyle = scores[0]; // Best case by default

    for (let i = 0; i < scores.length; i++) {
      if (profitabilityWeight < weightColorScale * Math.pow(2, i + 1)) {
        profitabilityStyle = scores[scores.length - i - 1];
        break;
      }
    }

    const profitabilityTitle = (includeTitle ? profitabilityStyle.title : null);

    return (
      <span className="badge" style={{ backgroundColor: profitabilityStyle.color }} title={profitabilityTitle}>
        {numeral(profitabilityWeight.toFixed(0)).format('0,0')}%
      </span>
    );
  }

  if (!reward.stake) {
    return null;
  }

  return getStyledProfitabilityScore(reward.stake.roi);
  /*
    const getStyledProfitabilityScore = (profitabilityWeight) => {
      const weightColorScale = config.profitabilityScore.weightColorScale;
      const scores = config.profitabilityScore.scoreStyles;
  
      let profitabilityStyle = scores[scores.length - 1]; // Worst case by default
  
      for (let i = 0; i < scores.length; i++) {
        if (profitabilityWeight < weightColorScale * Math.pow(2, i + 1)) {
          profitabilityStyle = scores[i];
          break;
        }
      }
  
      const profitabilityTitle = includeTitle ? profitabilityStyle.title : null;
  
      return (
        <span className="badge" style={{ backgroundColor: profitabilityStyle.color }} title={profitabilityTitle}>
          {profitabilityWeight.toFixed(0)}
        </span>
      );
    }
  
    const getProfitabilityWeight = (reward) => {
      const profitPercent = (reward.amount / reward.posInputAmount) * 100;
      const timeCostOfStake = (reward.posInputBlockHeightDiff / profitPercent);
      const profitabilityWeight = (timeCostOfStake * config.profitabilityScore.weightMultiplier);
  
      return profitabilityWeight;
    }
  
    const profitabilityWeight = getProfitabilityWeight(reward);
    return getStyledProfitabilityScore(profitabilityWeight);*/
}

export default PosProfitabilityScore;