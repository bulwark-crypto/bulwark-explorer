
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
        <div className={ `menu ${ this.state.isOpen ? 'menu--open' : 'menu--close' }` }>
          <div className="menu__wrapper">
            <div className="menu__header">
              <img src="/img/logo.jpg" className="menu__logo" />
              <a onClick={ this.handleToggle } >
                <Icon name="menu" className="menu__toggle" onClick={ this.handleToggle } />
              </a>
            </div>
            <p className="menu__title">MENU</p>
              <Link className="menu__item" to="/">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label" >Overview</span>
              </Link>
              <Link className="menu__item" to="/movement">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label" >Movement</span>
              </Link>
              <Link className="menu__item" to="/top">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label">Top 100</span>
              </Link>
              <Link className="menu__item" to="/masternode">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label">Masternode</span>
              </Link>
              <Link className="menu__item" to="/coin">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label" >Coin Info</span>
              </Link>
              <Link className="menu__item" to="/faq">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label">FAQ</span>
              </Link>
              <Link className="menu__item" to="/api">
                <Icon name="home" className="menu__icon" /> <span className="menu__item-label">API</span>
              </Link>
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
