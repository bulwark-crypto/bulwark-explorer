
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import PropTypes from 'prop-types';
import React from 'react';

export default class CardBlock extends Component {
  static defaultProps = {
    block: {},
    height: 0
  };

  static propTypes = {
    block: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired
  };

  render() {
    return (
      <div className="animated fadeIn">
      <div className="card--block">
        <div className="card__row">
          <span className="card__label">Hash:</span>
          <span className="card__result">{ this.props.block.hash }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Height:</span>
          <span className="card__result">{ this.props.block.height }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Difficulty:</span>
          <span className="card__result">{ this.props.block.diff }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Confirmations:</span>
          <span className="card__result">
            <span className="badge badge-success">
              { this.props.height - this.props.block.height }
            </span>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Size (kB):</span>
          <span className="card__result">{ this.props.block.size / 1024 }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Bits:</span>
          <span className="card__result">{ this.props.block.bits }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Nonce:</span>
          <span className="card__result">{ this.props.block.nonce }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Timestamp:</span>
          <span className="card__result">
            { dateFormat(this.props.block.createdAt) }
          </span>
        </div>
      </div>
      </div>
    );
  };
}
