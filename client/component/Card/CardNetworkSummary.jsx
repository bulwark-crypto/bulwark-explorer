
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';
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
    const hash = this.props.hashps;
    let lbl = 'GH/s';
    console.log(this.props);
    return (
      <Card title="Network" className="card--graph">
        <p className="card__data-main">{ hash } { lbl }</p>
        <p className="card__data-sub">Difficulty: { this.props.difficulty }</p>
        <GraphLine
          color="blue"
          data={ this.props.yAxis }
          height="50px"
          hideLines={ true }
          labels={ this.props.xAxis }
          width="300px" />
      </Card>
    );
  };
}
