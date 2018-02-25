
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';

export default class CardGraph extends Component {
  static defaultProps = {
    title: 'Graph',
  };
  static propTypes = {
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <Card title={ props.title } className="card--graph">
        <p className="card__data-main">1417.2417 GHs</p>
        <p className="card__data-sub">Difficulty: 23947.84191275</p>
        <div style={{width: '100%', height: 50, background: '#ccc'}}></div>
      </Card>
    );
  };
}
