
import blockchain from '../../lib/blockchain';
import Component from '../core/Component';
import { connect } from 'react-redux';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Actions from '../core/Actions';

import HorizontalRule from '../component/HorizontalRule';

class PoS extends Component {
  static propTypes = {
    getPos: PropTypes.func.isRequired,
    coin: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      stateHash: null,
      amount: 0.0,
      mn: 0.0,
      mns: 'None',
      pos: 0.0,
      results: null
    };
  };

  componentDidMount() {
    this.calculatePos();
  };

  componentDidUpdate(prevProps) {
    // match.params: :fromInputAmount/:toInputAmount/:date/:restakeOnly

    // If any parameter in url changes re-compute the stake ROI%
    this.calculatePos();
  };

  calculatePos() {
    var newStateHash = JSON.stringify(this.props.match.params); // Create hash from url params

    if (!this.stateHash || this.stateHash != newStateHash) {
      this.stateHash = newStateHash;
      this.setState({ loading: true })
      this.props.getPos(this.props.match.params).then((results) => {
        this.setState({ results, loading: false })
      }).catch(error => this.setState({ error, loading: false }));
    }
  }

  getRewardHours = (pos) => {
    if (!pos || pos < 0) {
      return 0.0;
    }

    return (blockchain.mncoins / pos) * this.props.coin.avgMNTime;
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
    if (this.state.loading) {
      return this.renderLoading();
    }

    const vX = this.getX();
    const vDay = this.getDay();
    const vWeek = this.getWeek();
    const vMonth = this.getMonth();

    let mns = 0.0;
    if (this.state.mns !== 'None') {
      mns = this.state.mns;
    }

    const avgAgeDays = (this.state.results.roi.avgTime / 1000 / 60 / 60 / 24).toFixed(2);
    return (
      <div>
        <HorizontalRule title="PoS Calculations" />
        <div class="alert alert-warning">
          Please note that these estimates are based on real, per-block data from blockchain. Proof Of Stake attacks like "stake grinding" will effect overall ROI% of the coin.
          Please check our block reward reduction schedule as these figures are based on real staking data and should be used for <strong>analytics only</strong>.
        </div>
        <br />
        <div className="row">
          <div className="col-sm-4 mb-2">
            <b>Average ROI%:</b>
          </div>
          <div className="col-sm-8 mb-2">
            <strong>{numeral(this.state.results.roi.avg).format('0,0.00')}% / year</strong>
          </div>
          <div className="col-sm-4">
            <b>Sample Addresses:</b>
          </div>
          <div className="col-sm-8">
            {this.state.results.uniqueAddresses}
          </div>
          <div className="col-sm-4">
            <b>Sample Size:</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.count).format('0,0')} stakes (~{numeral(this.state.results.count / this.state.results.uniqueAddresses).format('0,0.00')} / address)
          </div>
          <div className="col-sm-4">
            <b>Sample Rewards:</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.roi.sum).format('0,0')} BWK
          </div>
          <div className="col-sm-4 mt-2">
            <b>Avg. Input Age:</b>
          </div>
          <div className="col-sm-8 mt-2">
            {avgAgeDays} Days
          </div>
          <div className="col-sm-4">
            <b>Avg. Input Value:</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.roi.avgInputValue).format('0,0')} BWK
          </div>

          <div class="col-sm-12 mt-2 mb-2">
            <hr />
          </div>

          <div className="col-sm-4">
            <b>Min Stake ROI%:</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.roi.min).format('0,0.00')}% / year
          </div>
          <div className="col-sm-4">
            <b>Max Stake ROI%:</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.roi.max).format('0,0.00')}% / year
          </div>

          <div class="col-sm-12 mt-2 mb-2">
            <hr />
          </div>

          <div className="col-sm-4">
            <b>Input Size (From):</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.fromInputAmount).format('0,0')} BWK
          </div>
          <div className="col-sm-4">
            <b>Input Size (To):</b>
          </div>
          <div className="col-sm-8">
            {numeral(this.state.results.toInputAmount).format('0,0')} BWK
          </div>
          <div className="col-sm-4">
            <b>Start Date:</b>
          </div>
          <div className="col-sm-8">
            {moment(this.state.results.minDate).utc().format('MM-DD-YYYY')}
          </div>
          <div className="col-sm-4">
            <b>Options:</b>
          </div>
          <div className="col-sm-8">
            {this.state.results.isRestake ? 'Include only re-staked inputs into sample size' : 'Include new inputs into sample size'}
          </div>
        </div>
      </div >
    );
  };
}

const mapDispatch = dispatch => ({

});

const mapState = state => ({
  getPos: query => Actions.getPos(null, query),
  coin: state.coins && state.coins.length
    ? state.coins[0]
    : { avgMNTime: 0.0, usd: 0.0 }
});

export default connect(mapState, mapDispatch)(PoS);
