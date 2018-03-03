
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardTXOut extends Component {
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
        { key: 'hash', title: 'Address' },
        { key: 'vout', title: 'Amount' }
      ]
    };
  };

  render() {
    return (
      <Table 
        cols={ this.state.cols } 
        data={ this.props.txs.map(tx => ({
          ...tx,
          vout: (
            <div className="bade badge-success">{ tx.vout.toFixed(8) }</div>
          )
        })) } />
    );
  };
}
