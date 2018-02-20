
import Component from './Core/Component';
import { Link, Route, Switch } from 'react-router-dom';
import React from 'react';

import API from './Container/API';
import Block from './Container/Block';
import CoinInfo from './Container/CoinInfo';
import FAQ from './Container/FAQ';
import Masternode from './Container/Masternode';
import Movement from './Container/Movement';
import Overview from './Container/Overview';
import Top100 from './Container/Top100';
import TX from './Container/Tx';

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
                (Icon) <Link className="label" to="/">Overview</Link>
              </li>
              <li>
                (Icon) <Link className="label" to="/movement">Movement</Link>
              </li>
              <li>
                (Icon) <Link className="label" to="/top">Top 100</Link>
              </li>
              <li>
                (Icon) <Link className="label" to="/masternode">Masternodes</Link>
              </li>
              <li>
                (Icon) <Link className="label" to="/coin">Coin Info</Link>
              </li>
              <li>
                (Icon) <Link className="label" to="/faq">FAQ</Link>
              </li>
              <li>
                (Icon) <Link className="label" to="/api">API</Link>
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
