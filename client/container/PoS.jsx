
import blockchain from '../../lib/blockchain';
import Component from '../core/Component';
import { connect } from 'react-redux';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Actions from '../core/Actions';
import config from '../../config'

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
      stateHash: null,
      error: null,
      loading: true,
      results: null,

      stateHashAddress: null,
      inputFrom: '',
      filterAddress: null, // One enter of inputForm fill address
      loadingAddress: false,
      resultsAddress: null
    };
  };

  componentDidMount() {
    this.calculatePos();
  };

  //@todo use componentWillReceiveProps instead
  componentDidUpdate(prevProps) {
    // match.params: :fromInputAmount/:toInputAmount/:date/:restakeOnly

    // If any parameter in url changes re-compute the stake ROI%
    this.calculatePos();
  };

  calculatePos() {
    var newStateHash = JSON.stringify(this.props.match.params); // Create hash from url params
    if (!this.stateHash || this.stateHash != newStateHash) {
      this.stateHash = newStateHash;

      this.setState({ loading: true, error: null })

      this.props.getPos(this.props.match.params).then((results) => {
        this.setState({ results, loading: false })
      }).catch(error => this.setState({ error, loading: false }));
    }

    if (this.state.filterAddress) {
      var newStateHashAddress = JSON.stringify({ ...newStateHash, address: this.state.filterAddress }); // Create hash from url params + address

      if (!this.stateHashAddress || this.stateHashAddress != newStateHashAddress) {
        this.stateHashAddress = newStateHashAddress;

        this.setState({ loadingAddress: true, resultsAddress: null })

        this.props.getPos({ ...this.props.match.params, address: this.state.filterAddress }).then((resultsAddress) => {
          this.setState({ resultsAddress, loadingAddress: false })
        }).catch(errorAddress => this.setState({ errorAddress, loadingAddress: false }));
      }
    }
  }

  handleFormSubmit = () => {
    this.setState({ filterAddress: this.state.inputFrom }); // This will trigger calculatePos() from componentDidUpdate()
  }

  handleKeyPressFrom = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.handleFormSubmit();
    } else {
      this.setState({
        inputFrom: ev.target.value.trim()
      });
    }
  };


  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    }
    if (this.state.loading) {
      return this.renderLoading();
    }

    const getInputParameters = (score) => {
      if (!score) {
        return null;
      }
      return (<div class="row">
        <div className="col-4">
          <b>Input Size (From):</b>
        </div>
        <div className="col-8">
          {numeral(score.fromInputAmount).format('0,0')} {config.coinDetails.shortName}
        </div>
        <div className="col-4">
          <b>Input Size (To):</b>
        </div>
        <div className="col-8">
          {numeral(score.toInputAmount).format('0,0')} {config.coinDetails.shortName}
        </div>
        <div className="col-4">
          <b>Start Date:</b>
        </div>
        <div className="col-8">
          {moment(score.minDate).utc().format('MM-DD-YYYY')}
        </div>
        <div className="col-4">
          <b>Re-Stake Only?:</b>
        </div>
        <div className="col-8">
          {score.isRestake ? 'Yes' : 'No (Include Both Stakes & Non-Restakes)'}
        </div>
      </div>)
    }

    const getScoreResults = () => {
      const score = this.state.results;
      const scoreAddress = this.state.resultsAddress;
      const columnSize = this.state.resultsAddress ? 4 : 8;

      return (<div class="row">
        <div className="col-4 mb-2">
          <b>Average ROI%:</b>
        </div>
        <div className={`col-${columnSize} mb-2`}>
          <strong>{numeral(score.roi.avg).format('0,0.00')}% / year</strong>
        </div>
        {scoreAddress && <div className={`col-${columnSize} mb-2`}>
          <strong>{numeral(scoreAddress.roi.avg).format('0,0.00')}% / year</strong>
        </div>}

        <div className="col-4">
          <b>Sample Addresses:</b>
        </div>
        <div className={`col-${columnSize}`}>
          {score.uniqueAddresses}
        </div>
        {scoreAddress && <div className={`col-${columnSize}`}>
          {scoreAddress.uniqueAddresses}
        </div>}

        <div className="col-4">
          <b>Sample Size:</b>
        </div>
        <div className={`col-${columnSize}`}>
          {numeral(score.count).format('0,0')} stakes (~{numeral(score.count / score.uniqueAddresses).format('0,0.00')} / address)
        </div>
        {scoreAddress && <div className={`col-${columnSize}`}>
          {numeral(scoreAddress.count).format('0,0')} stakes
        </div>}

        <div className="col-4">
          <b>Sample Rewards:</b>
        </div>
        <div className={`col-${columnSize}`}>
          {numeral(score.roi.sum).format('0,0')} {config.coinDetails.shortName}
        </div>
        {scoreAddress && <div className={`col-${columnSize}`}>
          {numeral(scoreAddress.roi.sum).format('0,0')} {config.coinDetails.shortName}
        </div>}

        <div className="col-4 mt-2">
          <b>Avg. Input Age:</b>
        </div>
        <div className={`col-${columnSize} mt-2`}>
          {avgAgeDays} Days
          </div>
        {scoreAddress && <div className={`col-${columnSize} mt-2`}>
          {avgAgeDaysAddress} Days
          </div>}

        <div className="col-4">
          <b>Avg. Input Value:</b>
        </div>
        <div className={`col-${columnSize}`}>
          {numeral(score.roi.avgInputValue).format('0,0')} {config.coinDetails.shortName}
        </div>
        {scoreAddress && <div className={`col-${columnSize}`}>
          {numeral(scoreAddress.roi.avgInputValue).format('0,0')} {config.coinDetails.shortName}
        </div>}

        <div class="col-12 mt-2 mb-2">
          <hr />
        </div>

        <div className="col-4">
          <b>Min Stake ROI%:</b>
        </div>
        <div className={`col-${columnSize}`}>
          {numeral(score.roi.min).format('0,0.00')}% / year
          </div>
        {scoreAddress && <div className={`col-${columnSize}`}>
          {numeral(scoreAddress.roi.min).format('0,0.00')}% / year
          </div>}

        <div className="col-4">
          <b>Max Stake ROI%:</b>
        </div>
        <div className={`col-${columnSize}`}>
          {numeral(score.roi.max).format('0,0.00')}% / year
          </div>
        {scoreAddress && <div className={`col-${columnSize}`}>
          {numeral(scoreAddress.roi.max).format('0,0.00')}% / year
          </div>}

      </div>)
    }

    const getComparisonHeaders = () => {
      if (!this.state.filterAddress) {
        return null;
      }
      return (<div class="row">
        <div className="col-4 mb-2">
        </div>
        <div className={`col-4 mb-2`}>
          <strong>Global Average</strong>
        </div>
        <div className={`col-4 mb-2`}>
          <strong>{this.state.filterAddress}</strong>
        </div>
      </div>)
    }


    const avgAgeDays = (this.state.results.roi.avgTime / 1000 / 60 / 60 / 24).toFixed(2)
    const avgAgeDaysAddress = this.state.resultsAddress ? (this.state.resultsAddress.roi.avgTime / 1000 / 60 / 60 / 24).toFixed(2) : 0;
    return (
      <div>
        <HorizontalRule title="PoS Calculations" />
        <div class="alert alert-warning">
          Please note that these estimates are based on real, per-block data from blockchain. Proof Of Stake attacks like "stake grinding" will effect overall ROI% of the coin.
          Please check our block reward reduction schedule as these figures are based on real staking data and should be used for <strong>analytics only</strong>.
        </div>
        <div class="row">
          <div className="col-sm-12 mb-2">
            <label class="d-block">
              <strong>Staking Address</strong>
              <input
                className="px-2"
                onKeyPress={this.handleKeyPressFrom}
                onChange={ev => this.setState({ inputFrom: ev.target.value.trim() })}
                ref={input => this.fromInputField = input}
                style={{ width: '100%' }}
                type="text"
                placeholder="Enter any address to compare rewards against"
                value={this.state.inputFrom} />
            </label>
          </div>
        </div>
        {getInputParameters(this.state.results)}
        <hr class="mt-3 mb-3" />
        <div class="mb-5">
          {getComparisonHeaders()}
          {getScoreResults()}
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
