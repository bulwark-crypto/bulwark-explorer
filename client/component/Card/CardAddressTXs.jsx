
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'
import { CarverMovementType } from '../../../lib/carver2d'

import Table from '../Table';

export default class CardAddressTXs extends Component {
  static defaultProps = {
    addressId: '',
    movements: []
  };

  static propTypes = {
    addressId: PropTypes.string.isRequired,
    movements: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'createdAt', title: 'Date' },
        { key: 'txId', title: 'Transaction ID' },
        { key: 'amount', title: 'Amount' },
        { key: 'balance', title: 'Balance' },
      ]
    };
  };

  render() {
    const getMovementTitle = (movement) => {
      switch (movement.carverMovementType) {
        case CarverMovementType.TxToCoinbaseRewardAddress:
          return "Proof Of Work Block Reward"
        case CarverMovementType.TxToMnAddress:
          return "Masternode Block Reward"
        case CarverMovementType.TxToPosAddress:
          return "Proof Of Stake Block Reward"
      }
      return null;
    }
    const getMovementIcon = (movement) => {
      switch (movement.carverMovementType) {
        case CarverMovementType.TxToCoinbaseRewardAddress:
        case CarverMovementType.TxToMnAddress:
        case CarverMovementType.TxToPosAddress:
          return <span class="ml-1">💎</span>
      }
      return null;
    }
    return (
      <div className="animated fadeIn">
        <Table
          cols={this.state.cols}
          data={this.props.movements.map((movement) => {
            const isSpent = movement.from._id == this.props.addressId;

            const balance = isSpent ? movement.fromBalance - movement.amount : movement.toBalance + movement.amount;

            const txId = isSpent ? movement.label.split(':')[1] : movement.from.label;

            return ({
              ...movement,
              amount: (<span>
                <span
                  className={`badge badge-${isSpent ? 'danger' : 'success'}`} title={getMovementTitle(movement)}>
                  {isSpent ? '-' : '+'} {numeral(movement.amount).format(config.coinDetails.coinNumberFormat)} BWK
                </span>
                {getMovementIcon(movement)}
              </span>
              ),
              balance: (
                <span>
                  {numeral(balance.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} BWK
              </span>
              ),
              createdAt: (
                <span className="text-nowrap">
                  {dateFormat(movement.date)}
                </span>
              ),
              txId: (
                <Link to={`/tx/${txId}`}>{txId}</Link>
              )
            });
          })} />
      </div>
    );
  };
}
