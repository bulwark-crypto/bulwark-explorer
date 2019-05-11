
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CountUp from '../CountUp';

export default class CardStatus extends Component {
  static defaultProps = {
    avgBlockTime: 90,
    avgMNTime: 24,
    blocks: 0,
    peers: 0,
    status: 'Offline'
  };

  static propTypes = {
    avgBlockTime: PropTypes.number.isRequired,
    avgMNTime: PropTypes.number.isRequired,
    blocks: PropTypes.number.isRequired,
    peers: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  };

  render() {
    const isOn = this.props.status === 'Online';

    return (
      <div className="animated fadeInUp">
      <Card title="Status" className="card--status" >
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
          <span className="card__result">{ (this.props.avgBlockTime || 0).toFixed(2) } seconds</span>
        </div>
        <div className="card__row">
          <span className="card__label">Avg. MN Payment:</span>
          <span className="card__result">{ (this.props.avgMNTime || 0).toFixed(2) } hours</span>
        </div>
      </Card>
      </div>
    );
  };
}
