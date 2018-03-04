
import blockchain from '../../../lib/blockchain';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

const CardEarnings = ({ coin }) => {
  const mncoins = 5000.0;
  const mns = coin.mnsOff + coin.mnsOn;
  const subsidy = blockchain.getMNSubsidy(coin.blocks, mns, coin.supply);
  const roiDay = subsidy * (((blockchain.blocksPerDay * subsidy) - mncoins) / mncoins);
  const roiWeek = subsidy * (((blockchain.blocksPerWeek * subsidy) - mncoins) / mncoins);
  const roiMonth = subsidy * (((blockchain.blocksPerMonth * subsidy) - mncoins) / mncoins);
  const roiYear = subsidy * (((blockchain.blocksPerYear * subsidy) - mncoins) / mncoins);

  const nbtc = v => numeral(v).format('0,0.0000');
  const nusd = v => numeral(v).format('$0,0.00');

  return (
    <Card title="Estimated Earnings (COIN/BTC/USD)">
      <div className="row">
        <div className="col-sm-12 col-md-4">
          DAILY
        </div>
        <div className="col-sm-12 col-md-8">
          { nbtc(roiDay) } BWK / { nbtc(roiDay * coin.btc) } BTC / { nusd(roiDay * coin.usd) }
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 col-md-4">
          WEEKLY
        </div>
        <div className="col-sm-12 col-md-8">
          { nbtc(roiWeek) } BWK / { nbtc(roiWeek * coin.btc) } BTC / { nusd(roiWeek * coin.usd) }
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 col-md-4">
          MONTHLY
        </div>
        <div className="col-sm-12 col-md-8">
          { nbtc(roiMonth) } BWK / { nbtc(roiMonth * coin.btc) } BTC / { nusd(roiMonth * coin.usd) }
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 col-md-4">
          YEARLY
        </div>
        <div className="col-sm-12 col-md-8">
          { nbtc(roiYear) } BWK / { nbtc(roiYear * coin.btc) } BTC / { nusd(roiYear * coin.usd) }
        </div>
      </div>
    </Card>
  );
};

CardEarnings.propTypes = {
  coin: PropTypes.object.isRequired
};

export default CardEarnings;