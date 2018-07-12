
import blockchain from '../../lib/blockchain';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import HorizontalRule from '../component/HorizontalRule';

class PoS extends Component {
  static propTypes = {
    coin: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      hours: 0,
      mn: 0,
      mns: 0,
      pos: 0
    };
  };

  componentDidMount() {
    this.getAmount();
  };

  componentDidUpdate(prevProps) {
    if (this.props.match.params.amount !== prevProps.match.params.amount) {
      this.getAmount();
    }
  };

  getAmount() {
    const { params: { amount } } = this.props.match;
    if (!!amount && !isNaN(amount)) {
      const { mn, mns, pos } = this.getRewardSplit(amount);
      const hours = this.getRewardHours(pos);
      this.setState({ amount, hours, mn, mns, pos });
    } else {
      this.setState({ error: 'Please provide an amount for staking calculations.' });
    }
  };

  getRewardSplit = (amount) => {
    let mns = 0;

    if (amount >= blockchain.mncoins) {
      mns = Math.floor(amount / blockchain.mncoins);
    }

    return {
      mn: mns * blockchain.mncoins,
      mns,
      pos: amount - (mns * blockchain.mncoins)
    };
  };

  getRewardHours = (pos) => {
    const v = blockchain.mncoins / pos;
    return v * this.props.coin.avgMNTime;
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    }

    const subsidy = blockchain.getSubsidy(this.props.coin.blocks + 1);
    const mnSubsidy = blockchain.getMNSubsidy(this.props.coin.blocks + 1);
    const posSubsidy = subsidy - mnSubsidy;

    return (
      <div>
        <HorizontalRule title="PoS Calculations" />
        <div className="row">
          <div className="col-sm-12 col-md-4">
            Block Subsidy:
          </div>
          <div className="col-sm-12 col-md-8">
            { subsidy }
          </div>
        </div>
        { false &&
          <div className="row">
            <div className="col-sm-12 col-md-4">
              Masternode/PoS:
            </div>
            <div className="col-sm-12 col-md-8">
              { mnSubsidy } / { posSubsidy }
            </div>
          </div>
        }
        { this.state.pos != this.state.amount && this.state.mn != 0 &&
          <div className="row">
            <div className="col-sm-12 col-md-4">
              Calculation Amount:
            </div>
            <div className="col-sm-12 col-md-8">
              { this.state.amount }
            </div>
          </div>
        }
        { this.state.mn > 0 &&
          <div className="row">
            <div className="col-sm-12 col-md-4">
              Masternode Amount:
            </div>
            <div className="col-sm-12 col-md-8">
              { this.state.mn }
              { this.state.mns > 1
                ? ` / ${ this.state.mns }`
                : null
              }
            </div>
          </div>
        }
        { this.state.mn > 0 &&
          <div className="row">
            <div className="col-sm-12 col-md-4">
              Masternode Hours:
            </div>
            <div className="col-sm-12 col-md-8">
              { this.props.coin.avgMNTime.toFixed(2) }
              { this.state.mns > 1
                ? ` x ${ this.state.mns } = ${ (this.props.coin.avgMNTime * this.state.mns).toFixed(2) }`
                : null
              }
            </div>
          </div>
        }
        { this.state.mn > 0 &&
          <div className="row">
            <div className="col-sm-12 col-md-4">
              Masternode Reward:
            </div>
            <div className="col-sm-12 col-md-8">
              { mnSubsidy }
              { this.state.mns > 1
                ? ` x ${ this.state.mns } = ${ mnSubsidy * this.state.mns }`
                : null
              }
            </div>
          </div>
        }
        <div className="row">
          <div className="col-sm-12 col-md-4">
            PoS Amount:
          </div>
          <div className="col-sm-12 col-md-8">
            { this.state.pos > 0
              ? this.state.pos
              : 'Masternode recommended'
            }
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            PoS Hours:
          </div>
          <div className="col-sm-12 col-md-8">
            { this.state.pos > 0
              ? this.state.hours.toFixed(2)
              : 'Masternode recommended'
            }
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            PoS Reward:
          </div>
          <div className="col-sm-12 col-md-8">
            { this.state.pos > 0
              ? posSubsidy
              : 'Masternode recommended'
            }
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
    : { avgMNTime: 0 }
});

export default connect(mapState, mapDispatch)(PoS);
