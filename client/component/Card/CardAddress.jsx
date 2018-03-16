
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import qrcode from 'qrcode';
import React from 'react';

export default class CardAddress extends Component {
  static defaultProps = {
    address: '',
    txs: []
  };

  static propTypes = {
    address: PropTypes.string.isRequired,
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
    qrcode.toCanvas(el, this.props.address, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  render() {
    let trecv = 0;
    let tsend = 0;

    return (
      <div className="row">
        <div className="col-md-12 col-lg-8">
          <div className="card--address">
            <div className="card__row">
              <span className="card__label">Wallet Address:</span>
              <span className="card__result">
                <h4>{ this.props.address }</h4>
              </span>
            </div>
            {/*
            <div className="card__row">
              <span className="card__label">Total Send:</span>
              <span className="card__result">{ tsend }</span>
            </div>
            <div className="card__row">
              <span className="card__label">Total Received:</span>
              <span className="card__result">{ trecv }</span>
            </div>
            <div className="card__row">
              <span className="card__label">Balance:</span>
              <span className="card__result">{ numeral(trecv - tsend).format('0,0.0000') }</span>
            </div>
            */}
          </div>
        </div>
        <div className="col-md-12 col-lg-4">
          <canvas id="qr-code" />
        </div>
      </div>
    );
  };
}
