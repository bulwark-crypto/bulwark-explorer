
import Component from '../../core/Component';
import config from '../../../config'
import numeral from 'numeral';
import PropTypes from 'prop-types';
import qrcode from 'qrcode';
import React from 'react';
import moment from 'moment';
import CarverAddressLabelWidget from '../AddressWidgets/CarverAddressLabeWidget'

export default class CardAddress extends Component {
  static defaultProps = {
    carverAddress: null,
  };

  static propTypes = {
    carverAddress: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (!!this.props.carverAddress) {
      this.drawQRCode();
    }
  };

  componentDidUpdate(prevProps) {
    if (!!this.props.carverAddress
      && this.props.carverAddress !== prevProps.carverAddress) {
      this.drawQRCode();
    }
  };

  drawQRCode = () => {
    const el = document.getElementById('qr-code');
    qrcode.toCanvas(el, this.props.carverAddress.label, { width: 220 }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  render() {


    const getLastMovement = () => {
      if (this.props.carverAddress.date === this.props.carverAddress.lastMovementDate) {
        return null;
      }

      return <div className="card__row mb-4">
        <span className="card__label">Last Active:</span>
        <span className="card__result">
          {moment(this.props.carverAddress.lastMovementDate).utc().format('YYYY-MM-DD HH:mm')} ({moment(this.props.carverAddress.lastMovementDate).utc().fromNow()})
        </span>
      </div>
    }

    const getReceived = () => {
      const received = (this.props.carverAddress.valueIn - this.props.carverAddress.powValueIn - this.props.carverAddress.posValueIn);
      if (!received) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">Received:</span>
        <span className="card__result">
          + {numeral(received.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getPowRewards = () => {
      if (!this.props.carverAddress.powValueIn) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">POW Rewards ({this.props.carverAddress.powCountIn}x💎):</span>
        <span className="card__result">
          + {numeral(this.props.carverAddress.powValueIn.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getPosRewards = () => {
      if (!this.props.carverAddress.posValueIn) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">POS Rewards ({this.props.carverAddress.posCountIn}x💎):</span>
        <span className="card__result">
          + {numeral(this.props.carverAddress.posValueIn.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getSent = () => {
      if (!this.props.carverAddress.valueOut) {
        return null;
      }
      return <div className="card__row">
        <span className="card__label">Sent:</span>
        <span className="card__result">
          - {numeral((this.props.carverAddress.valueOut).toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    return (
      <div className="animated fadeIn">
        <div className="row">
          <div className="col-md-12 col-lg-8">
            <div className="card--address">
              <div className="card__row">
                <span className="card__label card--address-wallet">Wallet Address:</span>
                <span className="card__result card--address-hash">
                  <CarverAddressLabelWidget carverAddress={this.props.carverAddress} />
                </span>
              </div>
              <div className="card__row mt-3">
                <span className="card__label">Address Created:</span>
                <span className="card__result">
                  {moment(this.props.carverAddress.date).utc().format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
              {getLastMovement()}
              <div class="mt-du-4">
                {getReceived()}
                {getPowRewards()}
                {getPosRewards()}
                {getSent()}

                <div className="card__row border-top mt-1 font-weight-500">
                  <span className="card__label">Balance:</span>
                  <span className="card__result">
                    {numeral(this.props.carverAddress.balance.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
                  </span>
                </div>
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
