
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import Icon from '../Icon';

export default class CardPoSCalc extends React.Component {
  constructor(props) {
    super(props);
    this.input = null;
    this.state = { amount: 0.0 };
  };

  handleClick = () => {
    const v = this.state.amount;

    if (!!v && !isNaN(v) && v > 0) {
      document.location.href = `/#/pos/${ v }`;
    } else {
      this.input.focus();
    }
  };

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.handleClick();
    } else {
      this.setState({ amount: ev.target.value });
    }
  };

  render() {
    return (
      <Card title="PoS Calculator">
        <div className="row">
          <div className="col-sm-12 col-md-8">
            <input
              onClick={ this.handleClick }
              onKeyPress={ this.handleKeyPress }
              onChange={ ev => this.setState({ amount: ev.target.value })}
              ref={ i => this.input = i }
              style={{ width: '100%' }}
              type="text"
              value={ this.state.amount } />
          </div>
          <div className="col-sm-12 col-md-4 text-center">
            <button onClick={ this.handleClick }>
              Estimate
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 text-gray">
            Submit for a recommended staking breakdown depending on amount and masternode selection count if applicable.
          </div>
        </div>
      </Card>
    );
  };
}
