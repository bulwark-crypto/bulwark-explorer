
import Actions from './core/Actions';
import Component from './core/Component';
import { connect } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { Link, Route, Switch } from 'react-router-dom';
import promise from 'bluebird';
import PropTypes from 'prop-types';
import React from 'react';

// Route Containers
import API from './container/API';
import Block from './container/Block';
import CoinInfo from './container/CoinInfo';
import FAQ from './container/FAQ';
import Masternode from './container/Masternode';
import Movement from './container/Movement';
import Overview from './container/Overview';
import Top100 from './container/Top100';
import TX from './container/Tx';

// Layout
import CoinSummary from './container/CoinSummary';
import Footer from './component/Footer';
import Icon from './component/Icon';
import Loading from './component/Loading';
import Menu from './component/Menu';
import SearchBar from './component/SearchBar';

class App extends Component {
  static propTypes = {
    getCoins: PropTypes.func.isRequired,
    getTXs: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      init: true,
      isOpen: true,
      limit: 10
    };
    this.timer = { coins: null, txs: null };
  };

  componentDidMount() {
    promise.all([
        this.props.getCoins({ limit: this.state.limit }),
        this.props.getTXs({ limit: this.state.limit })
      ])
      .then(() => {
        console.log('fetched coins and txs on init');
        this.getCoins();
        this.getTXs();
        console.log('removing init');
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
    console.log('getCoins');
    if (this.timer.coins) {
      clearTimeout(this.timer.coins);
    }

    this.timer.coins = setTimeout(() => {
      console.log('coins timer fired');
      this.props
        .getCoins({ limit: this.state.limit })
        .then(this.getCoins)
        .catch(this.getCoins);
    }, 60000); // 1 minute
  };

  getTXs = () => {
    console.log('getTXs');
    if (this.timer.txs) {
      clearTimeout(this.timer.txs);
    }

    this.timer.txs = setTimeout(() => {
      console.log('txs timer fired');
      this.props
        .getTXs({ limit: this.state.limit })
        .then(this.getTXs)
        .catch(this.getTXs);
    }, 30000); // 30 seconds
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    if (this.state.init) {
      return (
        <Loading />
      );
    }

    return (
      <HashRouter>
        <div>
          <Menu
            isOpen={ this.state.isOpen }
            handleToggle={ this.handleToggle } />
          <div className="content">
            <div className="content__wrapper">
              <SearchBar />
              <CoinSummary />
              <Switch>
                <Route exact path="/" component={ Overview } />
                <Route exact path="/api" component={ API } />
                <Route exact path="/block" component={ Block } />
                <Route exact path="/coin" component={ CoinInfo } />
                <Route exact path="/faq" component={ FAQ } />
                <Route exact path="/masternode" component={ Masternode } />
                <Route exact path="/movement" component={ Movement } />
                <Route exact path="/top" component={ Top100 } />
                <Route exact path="/tx" component={ TX } />
              </Switch>
            </div>
            <Footer />
          </div>
        </div>
      </HashRouter>
    );
  };
}

const mapDispatch = dispatch => ({
  getCoins: query => Actions.getCoinHistory(dispatch, query),
  getTXs: query => Actions.getTXLatest(dispatch, query)
});

const mapState = state => ({

});

export default connect(mapState, mapDispatch)(App);
