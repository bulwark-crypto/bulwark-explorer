
import Component from '../../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CountUp from '../CountUp';
import GraphLine from '../Graph/GraphLine';


export default class CardMasternodeSummary extends Component {
  static defaultProps = {
    offline: 0,
    online: 0,
    xAxis: [],
    yAxis: []
  };

  static propTypes = {
    offline: PropTypes.number.isRequired,
    online: PropTypes.number.isRequired,
    xAxis: PropTypes.arrayOf(PropTypes.string).isRequired,
    yAxis: PropTypes.arrayOf(PropTypes.number).isRequired
  };

  render() {
    const total = this.props.online + this.props.offline;

    return (
      <div className="animated fadeInUp">
      <Card
        className="card--graph"
        title="Masternode">
        <p className="card__data-main">
          <CountUp
            decimals={ 0 }
            duration={ 1 }
            end={ total }
            start={ 0 } />
        </p>
        <p className="card__data-sub">Online: { this.props.online }</p>
        <GraphLine
          color="#1991eb"
          className="card__graph"
          data={ this.props.yAxis.reverse() }
          height="100px"
          labels={ this.props.xAxis.reverse() } />
      </Card>
      </div>
    );
  };
}
