
import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CountUp from '../CountUp';
import GraphLine from '../Graph/GraphLine';
import Icon from '../Icon';

export default class CardStatus extends Component {
  static defaultProps = {
    btc: 0.0,
    usd: 0.0,
    xAxis: [],
    yAxis: []
  };

  static propTypes = {
    btc: PropTypes.number.isRequired,
    usd: PropTypes.number.isRequired,
    xAxis: PropTypes.array.isRequired,
    yAxis: PropTypes.array.isRequired
  };

  render() {
    const len = this.props.yAxis.length;
    const yAxis = this.props.yAxis;
    let growth = len > 0
      ? (yAxis[0] - yAxis[len - 1]) / yAxis[len - 1]
      : 0;
    if (!isFinite(growth)) {
      growth = 0.0;
    }
    const isPos = growth >= 0;
    const dirArrow = isPos ? 'arrow-up' : 'arrow-down';

    return (
      <Card className="card--market" title="Market">
        <p className="card__data-main bariol">
          <CountUp
            decimals={ 2 }
            duration={ 1 }
            end={ this.props.usd }
            prefix={ '$' }
            start={ 0 } />
        </p>
        <p className="card__data-sub">{ this.props.btc } BTC</p>
        <div className="card__info row">
          <div className="col-sm-12 col-md-6 col-lg-4">
            <p>
              <span
                className={ `u--text-${ isPos ? 'green' : 'red' }` }
                key={ dirArrow }>
                <Icon className="card__icon--arrow" name={ dirArrow } />
                <span>{ numeral(growth * 100.0).format('0,0.00') }% &nbsp;</span>
              </span>
              <span>In { this.props.xAxis.length * 5 } minutes</span>
            </p>
            <p className="card__info-source">Data from CoinMarketCap</p>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-8">
            <GraphLine
              color={ isPos ? '#61d75e' : '#ed1c24' }
              data={ this.props.yAxis.reverse() }
              height="100px"
              labels={ this.props.xAxis.reverse() } />
          </div>
        </div>
      </Card>
    );
  };
}
