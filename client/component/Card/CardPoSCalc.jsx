
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import Icon from '../Icon';

export default class CardPoSCalc extends React.Component {
  constructor(props) {
    super(props);
    this.input = null;
  };

  handleClick = (ev) => {
    const v = this.input.value;

    if (!!v && !isNaN(v)) {
      document.location.href = `/#/pos/${ v }`;
    }
  };

  render() {
    return (
      <Card title="PoS Calculator">
        <div className="row">
          <div className="col-sm-12 col-md-8">
            <input
              onClick={ this.handleClick }
              ref={ i => this.input = i }
              style={{ marginTop: 9 }}
              type="text" />
          </div>
          <div className="col-sm-12 col-md-4">
            <button onClick={ this.handleClick }>
              Estimate
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            Something here about how it is only an estimate.
          </div>
        </div>
      </Card>
    );
  };
}
