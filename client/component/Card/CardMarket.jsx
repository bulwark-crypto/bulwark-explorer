
import Component from '../../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
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

    return (
      <Card title="Market" className="card--market">
        <p className="card__data-main">BWK ${ this.props.usd }</p>
        <p className="card__data-sub">{ this.props.btc } BTC</p>
        <div className="card__info">
          <div>
            <p>
              <span className={ `u--text-${ isPos ? 'green' : 'red' }` }>
                <Icon
                  className="card__icon--arrow"
                  name={ isPos ? 'arrow-up' : 'arrow-down' } />
                <span>{ growth.toFixed(2) }% &nbsp;</span>
              </span>
              <span>In { this.props.xAxis.length * 5 } minutes</span>
            </p>
            <p className="card__info-source">Data from CoinMarketCap</p>
          </div>
          <GraphLine
            color={ isPos ? 'rgba(0,255,0,1)' : 'red' }
            data={ this.props.yAxis }
            height="30px"
            hideLines={ true }
            labels={ this.props.xAxis }
            width="200px" />
        </div>
      </Card>
    );
  };
}
