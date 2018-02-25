
import Component from './core/Component';
import { Link, Route, Switch } from 'react-router-dom';
import React from 'react';
import Menu from './component/Menu';

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
    const { state } = this;

    return (
      <div>
        <Menu
          isOpen={ state.isOpen }
          handleToggle={ this.handleToggle } />
        <div className="content">
          <div className="content__wrapper">
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
      </div>
    );
  };
}
