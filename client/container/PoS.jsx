
import blockchain from '../../lib/blockchain';
import Component from '../core/Component';
import { connect } from 'react-redux';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';
import Select from '../component/Select';

class PoS extends Component {
  static propTypes = {
    coin: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      amount: 0.0,
      mn: 0.0,
      mns: 'None',
      pos: 0.0
    };
  };

  componentDidMount() {
    this.getAmount();
  };

  componentDidUpdate(prevProps) {
    if (this.props.match.params.amount !== prevProps.match.params.amount) {
      this.setState({
        mn: 0.0,
        mns: 'None',
        pos: 0.0
      }, this.getAmount);
    }
  };

  getAmount() {
    const { params: { amount } } = this.props.match;
    if (!!amount && !isNaN(amount) && amount > 0) {
      const { mn, pos } = this.getRewardSplit(amount);
      this.setState({ amount, mn, pos });
    } else {
      this.setState({ error: 'Please provide an amount for staking calculations.' });
    }
  };

  getRewardSplit = (amount) => {
    let mn = 0;
    let pos = amount;

    if (this.state.mns !== 'None') {
      mn = this.state.mns * blockchain.mncoins;
      pos = amount - mn;
    }

    return { mn, pos };
  };

  getRewardHours = (pos) => {
    if (!pos || pos < 0) {
      return 0.0;
    }

    return (blockchain.mncoins / pos) * this.props.coin.avgMNTime;
  };

  renderMasternodeCount = () => {
    const mns = Math.floor(this.state.amount / blockchain.mncoins);
    const options = [];
    for (let i = 0; i <= mns; i++) {
      options.push({ label: !i ? 'None' : i, value: !i ? 'None' : i });
    }

    return (
      <div
        style={ this.state.mns < 1
          ? { marginBottom: 5, marginTop: -7 }
          : { marginBottom: 5, marginTop: -9 }
        }>
        <Select
          onChange={ v => this.setState({ mns: parseInt(v, 10) || 'None' }, this.getAmount) }
          selectedValue={ this.state.mns }
          options={ options } />
      </div>
    );
  };

  getX = () => {
    const subsidy = blockchain.getSubsidy(this.props.coin.blocks + 1);
    const mnSubsidy = blockchain.getMNSubsidy(this.props.coin.blocks + 1);
    const posSubsidy = subsidy - mnSubsidy;

    let pos = this.state.amount;
    let mn = 0.0;
    if (this.state.mns !== 'None') {
      mn = this.state.mns * blockchain.mncoins;
      pos -= mn;
    }

    return {
      mn,
      mnHours: this.props.coin.avgMNTime,
      mnSubsidy,
      pos,
      posHours: this.getRewardHours(pos),
      posSubsidy,
      subsidy
    }
  };

  getDay = () => {
    const x = this.getX();

    if (x.mnHours !== 24.0 && x.mnHours > 0) {
      x.mnSubsidy = (24.0 / x.mnHours) * x.mnSubsidy;
    } else if (x.mnHours <= 0) {
      x.mnSubsidy = 0.0;
    }
    x.mnHours = 24.0;

    if (x.posHours !== 24.0 && x.posHours > 0) {
      x.posSubsidy = (24.0 / x.posHours) * x.posSubsidy;
    } else if (x.posHours <= 0) {
      x.posSubsidy = 0.0;
    }
    x.posHours = 24.0;

    return x;
  };

  getWeek = () => {
    const x = this.getDay();

    x.mnHours *= 7;
    x.mnSubsidy *= 7;
    x.posHours *= 7;
    x.posSubsidy *= 7;
    x.subsidy *= 7;

    return x;
  };

  getMonth = () => {
    const x = this.getDay();

    x.mnHours *= 30;
    x.mnSubsidy *= 30;
    x.posHours *= 30;
    x.posSubsidy *= 30;
    x.subsidy *= 30;

    return x;
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    }

    const vX = this.getX();
    const vDay = this.getDay();
    const vWeek = this.getWeek();
    const vMonth = this.getMonth();

    let mns = 0.0;
    if (this.state.mns !== 'None') {
      mns = this.state.mns;
    }

    return (
      <div>
        <HorizontalRule title="PoS Calculations" />
        <p>
          Please note the following estimations are based on current block height,
          average block time, average masternode reward time, and current block reward schedule.
        </p>
        <br />
        <div className="row">
          <div className="col-sm-4">
            <b>Block Subsidy:</b>
          </div>
          <div className="col-sm-8">
            { numeral(vX.subsidy).format('0,0.0000') } BWK
          </div>
          <div className="col-sm-4">
            <b>PoS:</b>
          </div>
          <div className="col-sm-8">
            { numeral(vX.posSubsidy).format('0,0.0000') } BWK
          </div>
          <div className="col-sm-4">
            <b>Masternode:</b>
          </div>
          <div className="col-sm-8">
            { numeral(vX.mnSubsidy).format('0,0.0000') } BWK
          </div>
          <div className="col-sm-4">
            <b>Calculation Amount:</b>
          </div>
          <div className="col-sm-8">
            { numeral(this.state.amount).format('0,0.0000') } BWK
          </div>
        </div>
        <hr />
        <br />
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Masternode(s):
          </div>
          <div className="col-sm-12 col-md-2">
            { this.renderMasternodeCount() }
          </div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4"></div>
          <div className="col-sm-12 col-md-2">
            <small className="text-gray">X</small>
          </div>
          <div className="col-sm-12 col-md-2">
            <small className="text-gray">Day</small>
          </div>
          <div className="col-sm-12 col-md-2">
            <small className="text-gray">Week</small>
          </div>
          <div className="col-sm-12 col-md-2">
            <small className="text-gray">Month</small>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Masternode Amount (BWK):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.mn).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Masternode Hours:
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.mnHours).format('0,0.00') }
          </div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Masternode Reward (BWK):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.mnSubsidy * mns).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vDay.mnSubsidy * mns).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vWeek.mnSubsidy * mns).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vMonth.mnSubsidy * mns).format('0,0.0000') }
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-sm-12 col-md-4">
            PoS Amount (BWK):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.pos).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            PoS Reward Interval (Hours):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.posHours).format('0,0.00') }
          </div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
          <div className="col-sm-12 col-md-2"></div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            PoS Reward (BWK):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.posSubsidy).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vDay.posSubsidy).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vWeek.posSubsidy).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vMonth.posSubsidy).format('0,0.0000') }
          </div>
        </div>
        <hr />
        <br />
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Total Amount (BWK):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vX.mnSubsidy * mns + vX.posSubsidy).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vDay.mnSubsidy * mns + vDay.posSubsidy).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vWeek.mnSubsidy * mns + vWeek.posSubsidy).format('0,0.0000') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral(vMonth.mnSubsidy * mns + vMonth.posSubsidy).format('0,0.0000') }
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Total Amount (USD):
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral((vX.mnSubsidy * mns + vX.posSubsidy) * this.props.coin.usd).format('$0,0.00') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral((vDay.mnSubsidy * mns + vDay.posSubsidy) * this.props.coin.usd).format('$0,0.00') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral((vWeek.mnSubsidy * mns + vWeek.posSubsidy) * this.props.coin.usd).format('$0,0.00') }
          </div>
          <div className="col-sm-12 col-md-2">
            { numeral((vMonth.mnSubsidy * mns + vMonth.posSubsidy) * this.props.coin.usd).format('$0,0.00') }
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({

});

const mapState = state => ({
  coin: state.coins && state.coins.length
    ? state.coins[0]
    : { avgMNTime: 0.0, usd: 0.0 }
});

export default connect(mapState, mapDispatch)(PoS);
