
import Component from '../../core/Component';
import config from '../../../config'
import numeral from 'numeral';
import PropTypes from 'prop-types';
import qrcode from 'qrcode';
import React from 'react';
import moment from 'moment';
import CarverAddressLabelWidget from '../AddressWidgets/CarverAddressLabelWidget'
import CarverAddressBadgeWidget from '../AddressWidgets/CarverAddressBadgeWidget'
import { CarverAddressType } from '../../../lib/carver2d'

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
    const carverAddress = this.props.carverAddress;

    // Proof Of Work Rewards
    const powAddress = carverAddress.carverRewardAddresses.find(carverRewardAddresses => carverRewardAddresses.carverAddressType === CarverAddressType.ProofOfWork);
    const powValueIn = powAddress ? powAddress.valueOut : 0;
    const powCountIn = powAddress ? powAddress.countOut : 0;

    // Masternode Rewards
    const masternodeAddress = carverAddress.carverRewardAddresses.find(carverRewardAddresses => carverRewardAddresses.carverAddressType === CarverAddressType.Masternode);
    const mnValueIn = masternodeAddress ? masternodeAddress.valueOut : 0;
    const mnCountIn = masternodeAddress ? masternodeAddress.countOut : 0;

    // POS Rewards
    const posAddress = carverAddress.carverRewardAddresses.find(carverRewardAddresses => carverRewardAddresses.carverAddressType === CarverAddressType.ProofOfStake);
    const posValueIn = posAddress ? posAddress.valueOut : 0;
    const posCountIn = posAddress ? posAddress.countOut : 0;


    const getAdressWidget = () => {
      const addressWidgets = config.addressWidgets[carverAddress.label];
      if (addressWidgets) {
        // Each carver address can have it's own label 
        const carverAddressLabelWidget = addressWidgets.carverAddressLabelWidget;
        if (carverAddressLabelWidget) {
          return carverAddressLabelWidget;
        }
      }
      return null;
    }


    const getBadge = () => {
      const addressWidget = getAdressWidget();
      if (!addressWidget) {
        return null;
      }
      const badge = addressWidget.badge;
      if (!badge) {
        return null;
      }

      return <div className="card__row mt-1">
        <span className="card__label">Label:</span>
        <span className="card__result">
          <CarverAddressBadgeWidget carverAddress={carverAddress} />
        </span>
      </div>
    }
    const getAddressTitle = () => {
      const addressWidget = getAdressWidget();
      if (!addressWidget || !addressWidget.title) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">Description:</span>
        <span className="card__result">
          <p class="card__info-source">{addressWidget.title}</p>
        </span>
      </div>
    }

    const getLastMovement = () => {
      if (carverAddress.lastMovement === null || carverAddress.date === carverAddress.lastMovement.carverMovement.date) {
        return null;
      }

      return <div className="card__row mb-4">
        <span className="card__label">Last Active:</span>
        <span className="card__result">
          {moment(carverAddress.lastMovement.carverMovement.date).utc().format('YYYY-MM-DD HH:mm')} ({moment(carverAddress.lastMovement.carverMovement.date).utc().fromNow()})
        </span>
      </div>
    }

    const getReceived = () => {
      const received = (carverAddress.valueIn);
      if (!received) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">Received ({carverAddress.countIn} TXs):</span>
        <span className="card__result">
          +{numeral(received.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getPowRewards = () => {
      if (!powValueIn) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">POW Rewards ({powCountIn}x💎):</span>
        <span className="card__result">
          +{numeral(powValueIn.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getPosRewards = () => {
      if (!posValueIn) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">POS Rewards ({posCountIn}x💎):</span>
        <span className="card__result">
          +{numeral(posValueIn.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }
    const getMnRewards = () => {
      if (!mnValueIn) {
        return null;
      }

      return <div className="card__row">
        <span className="card__label">MN Rewards ({mnCountIn}x💎):</span>
        <span className="card__result">
          +{numeral(mnValueIn.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getSent = () => {
      if (!carverAddress.valueOut) {
        return null;
      }
      return <div className="card__row">
        <span className="card__label">Sent ({carverAddress.countOut} TXs):</span>
        <span className="card__result">
          -{numeral((carverAddress.valueOut).toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
      </div>
    }

    const getPosAverages = () => {

      if (!carverAddress.posAverages) {
        return null;
      }

      const posAgeTime = (carverAddress.posAverages.ageTime / 1000 / 60 / 60 / 24).toFixed(2);
      return (<div class="mb-3">
        <div className="card__row">
          <span className="card__label">💎 POS Avg. ROI%:</span>
          <span className="card__result">
            {carverAddress.posAverages.avgRoi.toFixed(2)}%
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">💎 POS Total Rewards:</span>
          <span className="card__result">
            {numeral(posValueIn.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName} ({posCountIn} Stakes)
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">💎 POS Input Avg. Age:</span>
          <span className="card__result">
            {posAgeTime} Days
        </span>
        </div>
        <div className="card__row">
          <span className="card__label">💎 POS Input Avg. Value:</span>
          <span className="card__result">
            {carverAddress.posAverages.avgInputValue.toFixed(config.coinDetails.displayDecimals)} {config.coinDetails.shortName}
          </span>
        </div>
      </div>)
    }

    return (
      <div className="animated fadeIn">
        <div className="row">
          <div className="col-md-12 col-lg-8">
            <div className="card--address">
              <div className="card__row">
                <span className="card__label card--address-wallet">Wallet Address:</span>
                <span className="card__result card--address-hash">
                  <CarverAddressLabelWidget carverAddress={carverAddress} showBadge={false} />
                </span>
              </div>
              {getAddressTitle()}
              {getBadge()}
              <div className="card__row">
                <span className="card__label">Address Created:</span>
                <span className="card__result">
                  {moment(carverAddress.date).utc().format('YYYY-MM-DD HH:mm')} ({moment(carverAddress.date).utc().fromNow()})
                </span>
              </div>
              {getLastMovement()}
              {getPosAverages()}
              <div class="mt-4">
                {getReceived()}
                {getPowRewards()}
                {getPosRewards()}
                {getMnRewards()}
                {getSent()}

                <div className="card__row border-top mt-1 font-weight-500">
                  <span className="card__label">Balance:</span>
                  <span className="card__result">
                    {numeral(carverAddress.balance.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
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
