
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import GraphLine from '../component/Graph/GraphLine';

class Statistics extends Component {
  static propTypes = {
    // Dispatch
    getCoins: PropTypes.func.isRequired,
    getTXs: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      coins: [],
      error: null,
      loading: true,
      txs: []
    };
  };

  componentDidMount() {
    Promise.all([
        this.props.getCoins(),
        this.props.getTXs()
      ])
      .then((res) => {
        this.setState({
          coins: res[0], // 7 days at 5 min = 2016 coins
          loading: false,
          txs: res[1]
        });
      });
  };

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }

    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-lg-6">
            <div className="">Network Hash Rate Last 7 Days</div>
            <div className="">1416.2454</div>
            <div className="">Difficulty: 123457.3244</div>
            <div>
              <GraphLine
                color="#1991eb"
                data={ this.state.coins.reverse().map(c => c.netHash ? c.netHash : 0.0) }
                height="100px"
                hideLines={ false }
                labels={ this.state.coins.reverse().map(c => c.createdAt) } />
            </div>
          </div>
          <div className="col-md-12 col-lg-6">
            <div className="">Transactions Last 7 Days</div>
            <div className="">234545</div>
            <div className="">Average: 2344 Per Second</div>
            <div>
              <GraphLine
                color="#1991eb"
                data={ this.state.txs.reverse().map(c => c.total ? c.total : 0.0) }
                height="100px"
                hideLines={ false }
                labels={ this.state.txs.reverse().map(c => c._id) } />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-lg-6">
            <div className="">Bulwark Price USD</div>
            <div className="">$1.45</div>
            <div className="">0.0001423 BTC</div>
            <div>
              <GraphLine
                color="#1991eb"
                data={ this.state.coins.reverse().map(c => c.usd ? c.usd : 0.0) }
                height="100px"
                hideLines={ false }
                labels={ this.state.coins.reverse().map(c => c.createdAt) } />
            </div>
          </div>
          <div className="col-md-12 col-lg-6">
            <div className="">Masternodes Online Last 7 Days</div>
            <div className="">567</div>
            <div className="">Seen: 654</div>
            <div>
              <GraphLine
                color="#1991eb"
                data={ this.state.coins.reverse().map(c => c.mnsOn ? c.mnsOn : 0) }
                height="100px"
                hideLines={ false }
                labels={ this.state.coins.reverse().map(c => c.createdAt) } />
            </div>
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getCoins: () => Actions.getCoinsWeek(dispatch),
  getTXs: () => Actions.getTXsWeek(dispatch)
});

const mapState = state => ({

});

export default connect(mapState, mapDispatch)(Statistics);
