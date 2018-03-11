
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';

export default class MenuDesktop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    }
  }

  handleToggle = () => this.setState({ show: !this.state.show });

  render() {
    return (
      <div className={ `menu-desktop ${ this.state.show ? 'menu-desktop--open' : 'menu-desktop--close' }` }>
        <div className="menu-desktop__content-wrapper">
          <div className="menu-desktop__header">
            <img src="/img/whitelogo.svg" className="menu-desktop__logo" />
            <a onClick={ this.handleToggle } >
              <Icon name="bars" className="menu-desktop__toggle" onClick={ this.handleToggle } />
            </a>
          </div>
          <p className="menu-desktop__title">MENU</p>
          <Link className="menu-desktop__item" to="/">
            <img className="menu-desktop__icon" src="/img/home_white.svg" />
            <span className="menu-desktop__item-label" >Overview</span>
          </Link>
          <Link className="menu-desktop__item" to="/movement">
            <img className="menu-desktop__icon" src="/img/movement_white.svg" />
            <span className="menu-desktop__item-label" >Movement</span>
          </Link>
          {/*
          <Link className="menu-desktop__item" to="/top">
            <img className="menu-desktop__icon" src="/img/top100_white.svg" />
            <span className="menu-desktop__item-label">Top 100</span>
          </Link>
          */}
          <Link className="menu-desktop__item" to="/masternode">
            <img className="menu-desktop__icon" src="/img/masternodes_white.svg" />
            <span className="menu-desktop__item-label">Masternode</span>
          </Link>
          <Link className="menu-desktop__item" to="/coin">
            <img className="menu-desktop__icon" src="/img/coininfo_white.svg" />
            <span className="menu-desktop__item-label" >Coin Info</span>
          </Link>
          {/*
          <Link className="menu-desktop__item" to="/faq">
            <img className="menu-desktop__icon" src="/img/Jobs-icon@2x.png" />
            <span className="menu-desktop__item-label">FAQ</span>
          </Link>
          */}
          <Link className="menu-desktop__item" to="/api">
            <img className="menu-desktop__icon" src="/img/api_white.svg" />
            <span className="menu-desktop__item-label">API</span>
          </Link>
        </div>
      </div>
    )
  }
}
