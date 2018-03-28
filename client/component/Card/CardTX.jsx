
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

export default class CardTX extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    tx: PropTypes.object.isRequired
  };

  render() {
    let blockValue = 0.0;
    const confirmValue = this.props.height - this.props.tx.blockHeight;
    const confirmBadgeClass = (confirmValue > 0) ? (confirmValue < 6) ? 'primary' : 'success' : 'danger';
    if (this.props.tx.vout && this.props.tx.vout.length) {
      this.props.tx.vout.forEach(vout => blockValue += vout.value);
    }

    return (
      <div className="card--block">
        <div className="card__row">
          <span className="card__label">TXID:</span>
          <span className="card__result">{ this.props.tx.txId }</span>
        </div>
        <div className="card__row">
          <span className="card__label">Confirmations:</span>
          <span className="card__result">
            <span className={ `card__badge badge badge-${ confirmBadgeClass }` }>
              { confirmValue }
            </span>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Block Value:</span>
          <span className="card__result">{ numeral(blockValue).format('0,0.0000') } BWK</span>
        </div>
        <div className="card__row">
          <span className="card__label">Block Hash:</span>
          <span className="card__result">
            <Link to={ `/block/${ this.props.tx.blockHash }` }>{ this.props.tx.blockHash }</Link>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Block Height:</span>
          <span className="card__result">
            <Link to={ `/block/${ this.props.tx.blockHeight }` }>{ this.props.tx.blockHeight }</Link>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Timestamp:</span>
          <span className="card__result">
            { dateFormat(this.props.tx.createdAt) }
          </span>
        </div>
      </div>
    );
  };
}
