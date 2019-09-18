
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'
import CarverAddressLabelWidget from '../AddressWidgets/CarverAddressLabelWidget'

export default class CardTX extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    tx: PropTypes.object.isRequired
  };

  render() {
    const blockValue = this.props.tx.amountOut;
    const confirmValue = this.props.height - this.props.tx.blockHeight;
    const confirmBadgeClass = (confirmValue > 0)
      ? (confirmValue < 6) ? 'warning' : 'success'
      : 'danger';

    return (
      <div className="animated fadeIn">
        <div className="card--block">
          <div className="card__row">
            <span className="card__label">TXID:</span>
            <span className="card__result">
              <CarverAddressLabelWidget carverAddress={{ label: this.props.tx.txId }} showBadge={false} />
            </span>
          </div>
          <div className="card__row">
            <span className="card__label">Confirmations:</span>
            <span className="card__result">
              <span className={`card__badge badge badge-${confirmBadgeClass}`}>
                {confirmValue}
                <span className="indicator">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </span>
            </span>
          </div>
          <div className="card__row">
            <span className="card__label">Block Value:</span>
            <span className="card__result"><Link to={`/block/${this.props.tx.blockHeight}`}>{numeral(blockValue).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}</Link></span>
          </div>
          <div className="card__row">
            <span className="card__label">Block Height:</span>
            <span className="card__result">
              <Link to={`/block/${this.props.tx.blockHeight}`}>{this.props.tx.blockHeight}</Link>
            </span>
          </div>
          <div className="card__row">
            <span className="card__label">Timestamp:</span>
            <span className="card__result">
              {dateFormat(this.props.tx.date)}
            </span>
          </div>
        </div>
      </div>
    );
  };
}
