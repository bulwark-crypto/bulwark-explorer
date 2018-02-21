
import Component from './core/Component';
import { Link, Route, Switch } from 'react-router-dom';
import React from 'react';

import API from './container/API';
import Block from './container/Block';
import CoinInfo from './container/CoinInfo';
import FAQ from './container/FAQ';
import Icon from './component/Icon';
import Masternode from './container/Masternode';
import Movement from './container/Movement';
import Overview from './container/Overview';
import Top100 from './container/Top100';
import TX from './container/Tx';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    };
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (
      <div className="wrapper">
        <div className="menu">
          <div className={ `links ${ this.state.isOpen ? 'open' : 'close' }` }>
            <a onClick={ this.handleToggle }>Menu</a>
            <div>{ this.state.isOpen ? 'Logo' : 'Icon' }</div>
            <ul>
              <li>
                <Icon name="home" /> <Link className="label" to="/">Overview</Link>
              </li>
              <li>
                <Icon name="home" /> <Link className="label" to="/movement">Movement</Link>
              </li>
              <li>
                <Icon name="home" /> <Link className="label" to="/top">Top 100</Link>
              </li>
              <li>
                <Icon name="home" /> <Link className="label" to="/masternode">Masternodes</Link>
              </li>
              <li>
                <Icon name="home" /> <Link className="label" to="/coin">Coin Info</Link>
              </li>
              <li>
                <Icon name="home" /> <Link className="label" to="/faq">FAQ</Link>
              </li>
              <li>
                <Icon name="home" /> <Link className="label" to="/api">API</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="body">
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
      </div>
    );
  };
}
