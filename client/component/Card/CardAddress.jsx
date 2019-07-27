
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import qrcode from 'qrcode';
import React from 'react';

export default class CardAddress extends Component {
  static defaultProps = {
    address: '',
    balance: 0.0,
    received: 0.0,
    txs: [],
  };

  static propTypes = {
    address: PropTypes.string.isRequired,
    balance: PropTypes.number.isRequired,
    received: PropTypes.number.isRequired,
    txs: PropTypes.array.isRequired
  };

  componentDidMount() {
    if (!!this.props.address) {
      this.drawQRCode();
    }
  };

  componentDidUpdate(prevProps) {
    if (!!this.props.address
      && this.props.address !== prevProps.address) {
      this.drawQRCode();
    }
  };

  drawQRCode = () => {
    const el = document.getElementById('qr-code');
    qrcode.toCanvas(el, this.props.address, { width: 220 }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  render() {
    return (
      <div className="animated fadeIn">
        <div className="row">
          <div className="col-md-12 col-lg-8">
            <div className="card--address">
              <div className="card__row">
                <span className="card__label card--address-wallet">
                  Wallet Address:
              </span>
                <span className="card__result card--address-hash">
                  {this.props.address}
                </span>
              </div>
              <div className="card__row">
                <span className="card__label">
                  Sent:
              </span>
                <span className="card__result">
                  -{numeral(this.props.received - this.props.balance).format('0,0.0000')} BWK
              </span>
              </div>
              <div className="card__row">
                <span className="card__label">
                  Received:
              </span>
                <span className="card__result">
                  +{numeral(this.props.received).format('0,0.0000')} BWK
              </span>
              </div>
              <div className="card__row">
                <span className="card__label">
                  Balance:
              </span>
                <span className="card__result">
                  {numeral(this.props.balance).format('0,0.0000')} BWK
              </span>
              </div>
            </div>
          </div>
          <div className="col-md-12 col-lg-4 text-right">
            <canvas id="qr-code" />
          </div>
        </div>
      </div>
    );
  };
}
