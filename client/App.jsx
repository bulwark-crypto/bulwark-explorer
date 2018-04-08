
import Actions from './core/Actions';
import Component from './core/Component';
import { connect } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { isAddress, isBlock } from '../lib/blockchain';
import { Link, Route, Switch } from 'react-router-dom';
import promise from 'bluebird';
import PropTypes from 'prop-types';
import React from 'react';

// Route Containers
import Address from './container/Address';
import API from './container/API';
import Block from './container/Block';
import CoinInfo from './container/CoinInfo';
import Error404 from './container/Error404';
import FAQ from './container/FAQ';
import Masternode from './container/Masternode';
import Movement from './container/Movement';
import Overview from './container/Overview';
import Peer from './container/Peer';
import Statistics from './container/Statistics';
import Top100 from './container/Top100';
import TX from './container/TX';

// Layout
import CoinSummary from './container/CoinSummary';
import Footer from './component/Footer';
import Icon from './component/Icon';
import Loading from './component/Loading';
import Menu from './component/Menu';
import Notification from './component/Notification';
import SearchBar from './component/SearchBar';

class App extends Component {
  static propTypes = {
    // Dispatch
    getCoins: PropTypes.func.isRequired,
    getTXs: PropTypes.func.isRequired,
    setWatch: PropTypes.func.isRequired,
    // State
    watch: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      init: true,
      limit: 10
    };
    this.timer = { coins: null, txs: null };
  };

  componentDidMount() {
    promise.all([
        this.props.getCoins({ limit: 12 }),
        this.props.getTXs({ limit: 10 })
      ])
      .then(() => {
        this.getCoins();
        this.getTXs();
        this.setState({ init: false });
      })
      .catch(error => this.setState({ error }, () => {
        this.getCoins();
        this.getTXs();
      }));
  };

  componentWillUnmount() {
    if (this.timer.coins) {
      clearTimeout(this.timer.coins);
    }
    if (this.timer.txs) {
      clearTimeout(this.timer.txs);
    }
    this.timer = { coins: null, txs: null };
  };

  getCoins = () => {
    if (this.timer.coins) {
      clearTimeout(this.timer.coins);
    }

    this.timer.coins = setTimeout(() => {
      this.props
        .getCoins({ limit: 12 })
        .then(this.getCoins)
        .catch(this.getCoins);
    }, 60000); // 1 minute
  };

  getTXs = () => {
    if (this.timer.txs) {
      clearTimeout(this.timer.txs);
    }

    this.timer.txs = setTimeout(() => {
      this.props
        .getTXs({ limit: 10 })
        .then(this.getTXs)
        .catch(this.getTXs);
    }, 30000); // 30 seconds
  };

  handleSearch = (term) => {
    let path = '/#/';
    if (isBlock(term)) {
      path = `/#/block/${ term }`;
    } else if (isAddress(term)) {
      path = `/#/address/${ term }`;
    } else {
      path = `/#/tx/${ term }`;
    }

    document.location.href = path;

    if (this.props.watch.length && this.props.watch[0] === term) {
      return;
    }

    this.props.setWatch(term);
  };

  render() {
    if (this.state.init) {
      return (
        <Loading />
      );
    }

    return (
      <HashRouter>
        <div className="page-wrapper">
          <Menu onSearch={ this.handleSearch } />
          <div className="content">
            <div className="content__wrapper">
              {/* <Notification /> */}
              <SearchBar
                className="d-none d-md-block mb-3"
                onSearch={ this.handleSearch } />
              <CoinSummary onSearch={ this.handleSearch } />
              <Switch>
                <Route exact path="/" component={ Overview } />
                <Route exact path="/address/:hash" component={ Address } />
                <Route exact path="/api" component={ API } />
                <Route exact path="/block/:hash" component={ Block } />
                <Route exact path="/coin" component={ CoinInfo } />
                <Route exact path="/faq" component={ FAQ } />
                <Route exact path="/masternode" component={ Masternode } />
                <Route exact path="/movement" component={ Movement } />
                <Route exact path="/peer" component={ Peer } />
                <Route exact path="/statistics" component={ Statistics } />
                <Route exact path="/top" component={ Top100 } />
                <Route exact path="/tx/:hash" component={ TX } />
                <Route component={ Error404 } />
              </Switch>
              <Footer />
            </div>
          </div>
        </div>
      </HashRouter>
    );
  };
}

const mapDispatch = dispatch => ({
  getCoins: query => Actions.getCoinHistory(dispatch, query),
  getTXs: query => Actions.getTXLatest(dispatch, query),
  setWatch: term => Actions.setWatch(dispatch, term)
});

const mapState = state => ({
  watch: state.watch
});

export default connect(mapState, mapDispatch)(App);
