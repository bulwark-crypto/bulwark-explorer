
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
    return (
      <div className="animated fadeIn">
        <Table
          cols={this.state.cols}
          data={this.props.movements.map((movement) => {
            const isSpent = movement.amount < 0;

            const balance = isSpent ? movement.balance - movement.amount : movement.balance + movement.amount;

            const txId = movement.carverMovement.txId;//isSpent ? movement.label.split(':')[1] : movement.from.label;

            return ({
              ...movement,
              amount: (<span>
                <span
                  className={`badge badge-${isSpent ? 'danger' : 'success'}`} title={getMovementTitle(movement)}>
                  {isSpent ? '-' : '+'} {numeral(movement.amount * (isSpent ? -1 : 1)).format(config.coinDetails.coinNumberFormat)} BWK
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
