
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';

export default class CardStatus extends Component {
  static defaultProps = {
    title: 'Status',
  };
  static propTypes = {
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <Card title={ props.title } className="card--status">
        <div className="card__row">
          <span className="card__label">Status:</span>
          <span className="card__result card__result--status">Online</span>
        </div>
        <div className="card__row">
          <span className="card__label">Blocks:</span>
          <span className="card__result"><b>321021</b></span>
        </div>
        <div className="card__row">
          <span className="card__label">Peers:</span>
          <span className="card__result">342</span>
        </div>
        <div className="card__row">
          <span className="card__label">Avg. Block Time:</span>
          <span className="card__result">2 Minutes</span>
        </div>
      </Card>
    );
  };
}
