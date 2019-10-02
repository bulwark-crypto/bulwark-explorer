
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import Select from '../../component/Select';
import Icon from '../Icon';

export default class CardPoSCalc extends React.Component {
  constructor(props) {
    super(props);
    this.fromInputField = null;
    this.toInputField = null;

    this.state = {
      inputFrom: 1500.0,
      inputTo: 3000.0,
      date: (60 * 60 * 24 * 31).toString(), // Last Month
      restakeOnly: true
    };
  };

  handleClick = () => {
    const inputFrom = this.state.inputFrom;
    const isInputFromValid = !!inputFrom && !isNaN(inputFrom) && inputFrom > 0;

    const inputTo = this.state.inputTo;
    const isInputToValid = !!inputTo && !isNaN(inputTo) && inputTo > 0;

    if (!isInputFromValid) {
      this.fromInputField.focus();
    } else if (!isInputToValid) {
      this.toInputField.focus();
    } else {
      document.location.href = `/#/pos/${inputFrom}/${inputTo}/${this.state.date}/${this.state.restakeOnly ? '1' : '0'}`;
    }
  };

  handleKeyPressFrom = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.handleClick();
    } else {
      this.setState({
        inputFrom: ev.target.value.trim()
      });
    }
  };
  handleKeyPressTo = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.handleClick();
    } else {
      this.setState({
        inputTo: ev.target.value.trim()
      });
    }
  };

  handleDate = date => this.setState({ date });

  render() {

    const getDateDropdown = () => {
      // Caver movement types
      const sortOptions = [
        //{ label: 'Since Genesis', value: '0' },

        { label: 'Past Hour', value: (60 * 60).toString() },
        { label: 'Past 2 Hours', value: (60 * 60 * 2).toString() },
        { label: 'Past 4 Hours', value: (60 * 60 * 4).toString() },
        { label: 'Past 8 Hours', value: (60 * 60 * 8).toString() },
        { label: 'Past 24 Hours', value: (60 * 60 * 24).toString() },
        { label: 'Past 48 Hours', value: (60 * 60 * 24 * 2).toString() },
        { label: 'Past Week', value: (60 * 60 * 24 * 7).toString() },
        { label: 'Past Month', value: (60 * 60 * 24 * 31).toString() },
        { label: 'Past 3 Months', value: (60 * 60 * 24 * 31 * 3).toString() },
        { label: 'Past 6 Months', value: (60 * 60 * 24 * 31 * 6).toString() },
        { label: 'Past Year', value: (60 * 60 * 24 * 365).toString() },
        //{ label: 'Last 2 Years', value: (60 * 60 * 24 * 365 * 2).toString() },
      ];
      return <label className="mb-0 d-block">
        Date Range
          <Select
          onChange={value => this.handleDate(value)}
          selectedValue={this.state.date}
          options={sortOptions} />
      </label>
    }

    const getCarverIcon = () => {
      return <img src="data:image/png;base64,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" width="16" height="16" className="align-middle"></img>
    }
    return (
      <Card title="Staking ROI% Calculator" titleClassName="mb-3">
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <label>
              Input Size (From)
              <input
                className="px-2"
                onKeyPress={this.handleKeyPressFrom}
                onChange={ev => this.setState({ inputFrom: ev.target.value.trim() })}
                ref={input => this.fromInputField = input}
                style={{ width: '100%' }}
                type="text"
                value={this.state.inputFrom} />
            </label>
          </div>
          <div className="col-sm-12 col-md-6">
            <label>
              Input Size (To)
              <input
                className="px-2"
                onKeyPress={this.handleKeyPressTo}
                onChange={ev => this.setState({ inputTo: ev.target.value.trim() })}
                ref={input => this.toInputField = input}
                style={{ width: '100%' }}
                type="text"
                value={this.state.inputTo} />
            </label>

          </div>
          <div className="col-sm-6 text-left">
            <div>
              {getDateDropdown()}
            </div>

          </div>
          <div className="col-sm-6 text-left">
            <label className="pt-4 mb-0"><input type="checkbox" className="align-middle" checked={this.state.restakeOnly} onChange={ev => this.setState({ restakeOnly: ev.target.checked })} /> Re-Staking Only</label>
          </div>
          <div className="col-sm-12 small text-secondary text-center">
            <div>
              <button onClick={this.handleClick} className="mb-1">
                Estimate Stake ROI%
            </button>
            </div>
            <div className="mt-2 text-left">
              {getCarverIcon()} Based on realtime, per-block blockchain rewards data
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 text-gray">
          </div>
        </div>
      </Card>
    );
  };
}
