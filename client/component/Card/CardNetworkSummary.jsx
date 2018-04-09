
import Component from '../../core/Component';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CountUp from '../CountUp';
import GraphLine from '../Graph/GraphLine';


export default class CardNetworkSummary extends Component {
  static defaultProps = {
    difficulty: 0,
    hashps: 0,
    xAxis: [],
    yAxis: []
  };

  static propTypes = {
    difficulty: PropTypes.number.isRequired,
    hashps: PropTypes.number.isRequired,
    xAxis: PropTypes.arrayOf(PropTypes.string).isRequired,
    yAxis: PropTypes.arrayOf(PropTypes.number).isRequired
  };

  render() {
    const labels = ['H', 'kH', 'MH', 'GH', 'TH'];
    let hash = this.props.hashps;
    let idx = 0;
    while (hash > 1000) {
      hash = hash / 1000;
      idx++;
    }

    return (
      <div className="animated fadeInUp">
      <Card
        className="card--graph"
        title="Network">
        <p className="card__data-main">
          <CountUp
            decimals={ 2 }
            duration={ 1 }
            end={ hash }
            start={ 0 }
            suffix={ ` ${ labels[idx] }/s` } />
        </p>
        <p className="card__data-sub">
          Difficulty: { numeral(this.props.difficulty).format('0,0.00') }
        </p>
          <GraphLine
            color="#1991eb"
            className="card__graph"
            data={ this.props.yAxis.reverse() }
            height="100px"
            labels={ this.props.xAxis.reverse() }
           />
      </Card>
      </div>
    );
  };
}
