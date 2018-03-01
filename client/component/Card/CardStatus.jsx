
import Component from '../../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';

export default class CardStatus extends Component {
  static defaultProps = {
    avgBlockTime: '2 Minutes',
    blocks: 0,
    peers: 0,
    status: 'Offline'
  };

  static propTypes = {
    avgBlockTime: PropTypes.string.isRequired,
    blocks: PropTypes.number.isRequired,
    peers: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  };

  render() {
    return (
      <Card title="Status" className="card--status">
        <div className="card__row">
          <span className="card__label">Status:</span>
          <span className="card__result card__result--status">{ this.props.status }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Blocks:</span>
          <span className="card__result"><b>{ this.props.blocks }</b></span>
        </div>
        <div className="card__row">
          <span className="card__label">Peers:</span>
          <span className="card__result">{ this.props.peers }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Avg. Block Time:</span>
          <span className="card__result">{ this.props.avgBlockTime }</span>
        </div>
      </Card>
    );
  };
}
