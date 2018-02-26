
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';
import Icon from 'component/Icon';

export default class CardStatus extends Component {
  static defaultProps = {
    title: 'Market',
  };
  static propTypes = {
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <Card title={ props.title } className="card--market">
        <p className="card__data-main">BWK $4.21</p>
        <p className="card__data-sub">0.0003896 BTC</p>
        <div className="card__info">
          <div>
            <p>
              <span className="u--text-green">
                <Icon name="arrow-up" className="card__icon--arrow" />
                <span>4.2% &nbsp;</span>
              </span>
              <span>In the last Day</span>
            </p>
            <p className="card__info-source">Data from CoinMarketCap</p>
          </div>
          <div style={{flex: 1, height: 30, background: '#ccc'}}></div>
        </div>
      </Card>
    );
  };
}
