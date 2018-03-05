
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
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
          hash: (
            <div>
              { tx.scriptPubKey.addresses.map(a => (
                <div key={ a }>{ a }</div>
              )) }
            </div>
          ),
          vout: (
            <span className="bade badge-success">
              { numeral(tx.value).format('0,0.0000') } BWK
            </span>
          )
        })) } />
    );
  };
}
