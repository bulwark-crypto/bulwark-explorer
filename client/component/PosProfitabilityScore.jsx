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

    const styleIndex = Math.min(Math.round(((stakeRoi / (coin.posRoi24h * 2))) * (scoreStyles.length - 1)), scoreStyles.length - 1); // We'll use avg as 24h 50% mark for style
    let profitabilityStyle = scoreStyles[scoreStyles.length - 1 - styleIndex];

    const rankTitle = (includeTitle ? profitabilityStyle.title : null);
    const avgRoiTitle = `24h ROI Avg: ${coin.posRoi24h.toFixed(0)}%`
    const profitabilityTitle = `${rankTitle} (${avgRoiTitle})`;
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
