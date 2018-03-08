
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';

export default class MenuDesktop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    }
  }

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const { state } = this;

    return (
      <div className={ `menu-desktop ${ state.isOpen ? 'menu-desktop--open' : 'menu-desktop--close' }` }>
        <div className="menu-desktop__content-wrapper">
          <div className="menu-desktop__header">
            <img src="/img/Badge-White.png" className="menu-desktop__logo" />
            <a onClick={ this.handleToggle } >
              <Icon name="bars" className="menu-desktop__toggle" onClick={ this.handleToggle } />
            </a>
          </div>
          <p className="menu-desktop__title">MENU</p>
          <Link className="menu-desktop__item" to="/">
            <img className="menu-desktop__icon" src="/img/Home-icon@2x.png" />
            <span className="menu-desktop__item-label" >Overview</span>
          </Link>
          <Link className="menu-desktop__item" to="/movement">
            <img className="menu-desktop__icon" src="/img/Analytics-icon@2x.png" />
            <span className="menu-desktop__item-label" >Movement</span>
          </Link>
          <Link className="menu-desktop__item" to="/top">
            <img className="menu-desktop__icon" src="/img/Ratings-icon@2x.png" />
            <span className="menu-desktop__item-label">Top 100</span>
          </Link>
          <Link className="menu-desktop__item" to="/masternode">
            <img className="menu-desktop__icon" src="/img/Customers-icon@2x.png" />
            <span className="menu-desktop__item-label">Masternode</span>
          </Link>
          <Link className="menu-desktop__item" to="/coin">
            <img className="menu-desktop__icon" src="/img/Market-icon@2x.png" />
            <span className="menu-desktop__item-label" >Coin Info</span>
          </Link>
          {/*
          <Link className="menu-desktop__item" to="/faq">
            <img className="menu-desktop__icon" src="/img/Jobs-icon@2x.png" />
            <span className="menu-desktop__item-label">FAQ</span>
          </Link>
          */}
          <Link className="menu-desktop__item" to="/api">
            <img className="menu-desktop__icon" src="/img/Support-icon@2x.png" />
            <span className="menu-desktop__item-label">API</span>
          </Link>
        </div>
      </div>
    )
  }
}
