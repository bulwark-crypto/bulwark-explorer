
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardTXs extends Component {
  static defaultProps = {
    txs: []
  };

  static propTypes = {
    txs: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'hash', title: 'Transaction Hash' },
        { key: 'vout', title: 'Amount' },
        { key: 'createdAt', title: 'Time' },
      ]
    };
  };

  render() {
    return (
      <Table 
        cols={ this.state.cols } 
        data={ this.props.txs.map(tx => ({
          ...tx,
          createdAt: moment(tx.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
          hash: (
            <Link to={ `/tx/${ tx.hash }` }>
              { tx.hash }
            </Link>
          ),
          vout: (
            <span className="badge badge-success">
              { tx.vout.toFixed(8) }
            </span>
          )
        })) } />
    );
  };
}
