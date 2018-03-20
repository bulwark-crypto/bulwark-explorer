
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CountUp from '../CountUp';

export default class CardStatus extends Component {
  static defaultProps = {
    avgBlockTime: '1.50 minutes',
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
    const isOn = this.props.status === 'Online';

    return (
      <Card title="Status" className="card--status">
        <div className="card__row">
          <span className="card__label">Status:</span>
          <span className="card__result card__result--status">
            <span className={ `u--text-${ isOn ? 'green' : 'red' }`}>
              { this.props.status }
            </span>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Blocks:</span>
          <span className="card__result">
            <Link to={ `/block/${ this.props.blocks }` }>
              <b>
                <CountUp
                  decimals={ 0 }
                  duration={ 1 }
                  end={ this.props.blocks }
                  start={ 0 } />
              </b>
            </Link>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Peers:</span>
          <span className="card__result">
            <Link to="/peer">{ this.props.peers }</Link>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Avg. Block Time:</span>
          <span className="card__result">{ this.props.avgBlockTime }</span>
        </div>
      </Card>
    );
  };
}
