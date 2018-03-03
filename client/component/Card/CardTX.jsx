
import Component from '../../core/Component';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

export default class CardTX extends Component {
  static defaultProps = {
    height: 0,
    tx: {}
  };

  static propTypes = {
    height: PropTypes.number.isRequired,
    tx: PropTypes.object.isRequired
  };

  render() {
    console.log(this.props.height, this.props.tx);
    return (
      <div className="card--block">
        <div className="card__row">
          <span className="card__label">TXID:</span>
          <span className="card__result">{ this.props.tx.hash }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Confirmations:</span>
          <span className="card__result">
            <span className="badge badge-success">
              { this.props.height - this.props.tx.height }
            </span>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Block Index:</span>
          <span className="card__result">{ this.props.tx.vout }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Block Hash:</span>
          <span className="card__result">{ this.props.tx.block }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Timestamp:</span>
          <span className="card__result">
            { moment(this.props.tx.createdAt).format('YYYY-MM-DD hh:mm:ss A') }
          </span>
        </div>
      </div>
    );
  };
}
