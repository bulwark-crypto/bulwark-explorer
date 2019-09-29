import React from 'react';
import config from '../../config'
import { connect } from 'react-redux';
import numeral from 'numeral';

/**
 * Take reward and format it into a profitability score
 * @todo move to FormattedValues folder
 */
const PosProfitabilityScore = ({ reward, coin, includeTitle = true }) => {

  const getStyledProfitabilityScore = (stakeRoi) => {
    const scoreStyles = config.profitabilityScore.scoreStyles;

    const posRoi24h = coin.posRoi24h ? coin.posRoi24h : stakeRoi;

    const percentile = ((stakeRoi / (posRoi24h * 2)));
    const styleIndex = Math.min(Math.round(percentile * (scoreStyles.length - 1)), scoreStyles.length - 1); // We'll use avg as 24h 50% mark for style
    const profitabilityStyle = scoreStyles[scoreStyles.length - 1 - styleIndex];

    const rankTitle = (includeTitle ? profitabilityStyle.title : null);
    const avgRoiTitle = `24h Avg ${posRoi24h.toFixed(0)}%`;

    const rankPercentile = stakeRoi > posRoi24h ? `${(stakeRoi / posRoi24h).toFixed(2)}x faster` : `${(posRoi24h / stakeRoi).toFixed(2)}x slower`;


    const profitabilityTitle = coin.posRoi24h ? `${rankPercentile} vs ${avgRoiTitle} (${rankTitle})` : null; // If we can't figure out 24h pos ROI don't show any tooltip
    return (
      <span className="badge" style={{ backgroundColor: profitabilityStyle.color }} title={profitabilityTitle}>
        {numeral(stakeRoi.toFixed(0)).format('0,0')}%
      </span>
    );
  }

  if (!reward.stake) {
    return null;
  }

  return getStyledProfitabilityScore(reward.stake.roi);
}

const mapDispatch = dispatch => ({
});

const mapState = state => ({
  coin: state.coins.length ? state.coins[0] : {},
});

export default connect(mapState, mapDispatch)(PosProfitabilityScore);
