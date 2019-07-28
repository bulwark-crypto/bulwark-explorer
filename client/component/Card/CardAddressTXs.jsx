
import Component from '../../core/Component';
import { dateFormat } from '../../../lib/date';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

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
              amount: (
                <span
                  className={`badge badge-${isSpent ? 'danger' : 'success'}`}>
                  {isSpent ? '-' : '+'} {numeral(movement.amount).format('0,0.0000')} BWK
              </span>
              ),
              balance: (
                <span>
                  {numeral(balance.toFixed(4)).format('0,0.0000')} BWK
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
