
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import config from '../../../config'
import { CarverMovementType, CarverTxType } from '../../../lib/carver2d'

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
      if (movement.carverMovement.isReward) {
        return "Block Reward"
      }
      return null;
    }
    const getMovementIcon = (movement) => {
      if (movement.carverMovement.isReward) {
        return <span class="ml-1">💎</span>
      }
      return null;
    }
    const getAmountBadge = (movement, isOut) => {

      // We can 
      let amountModifier = 0;
      if (movement.carverMovement.txType === CarverTxType.ProofOfStake) {
        if (isOut) {
          return null;
        } else {
          amountModifier = movement.amountOut;
        }
      }

      const amount = (isOut ? -movement.amountOut : movement.amountIn) - amountModifier;
      if (amount === 0) {
        return null;
      }

      return <span>
        <span
          className={`badge badge-${isOut ? 'danger' : 'success'}`} title={getMovementTitle(movement)}>
          {isOut ? '-' : '+'} {numeral(amount * (isOut ? -1 : 1)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
        </span>
        {getMovementIcon(movement)}
      </span>
    }
    return (
      <div className="animated fadeIn">
        <Table
          cols={this.state.cols}
          data={this.props.movements.map((movement) => {

            const balance = movement.balance + movement.amountIn - movement.amountOut;

            const txId = movement.carverMovement.txId;

            return ({
              ...movement,
              amount: (
                <span>
                  {getAmountBadge(movement, false)}
                  {getAmountBadge(movement, true)}
                </span>
              ),
              balance: (
                <span>
                  {numeral(balance.toFixed(config.coinDetails.displayDecimals)).format(config.coinDetails.coinNumberFormat)} {config.coinDetails.shortName}
                </span>
              ),
              createdAt: (
                <span className="text-nowrap">
                  {dateFormat(movement.carverMovement.date)}
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
