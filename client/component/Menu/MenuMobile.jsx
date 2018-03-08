
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../Icon';

export default class MenuMobile extends Component {
  static defaultProps = {
    isOpen: true,
  };

  static propTypes = {
    isOpen: PropTypes.bool,
    handleToggle: PropTypes.func,
  };

  render() {
    const { props } = this;

    return (
      <div>
        <div className={ `menu-mobile ${ props.isOpen ? 'menu-mobile--open' : 'menu-mobile--close' }` }>
          <div className="menu-mobile__wrapper">
            <div className="menu-mobile__header">
              <img src="/img/Badge-White.png" className="menu-mobile__logo" />
              <a onClick={ props.handleToggle } >
                <Icon name="bars" className="menu-mobile__toggle" onClick={ props.handleToggle } />
              </a>
            </div>
            <p className="menu-mobile__title">MENU</p>
              <Link className="menu-mobile__item" to="/">
                <img className="menu-mobile__icon" src="/img/Home-icon@2x.png" />
                <span className="menu-mobile__item-label active" >Overview</span>
              </Link>
              <Link className="menu-mobile__item" to="/movement">
                <img className="menu-mobile__icon" src="/img/Analytics-icon@2x.png" />
                <span className="menu-mobile__item-label" >Movement</span>
              </Link>
              {/*
              <Link className="menu-mobile__item" to="/top">
                <img className="menu-mobile__icon" src="/img/Ratings-icon@2x.png" />
                <span className="menu-mobile__item-label">Top 100</span>
              </Link>
              */}
              <Link className="menu-mobile__item" to="/masternode">
                <img className="menu-mobile__icon" src="/img/Customers-icon@2x.png" />
                <span className="menu-mobile__item-label">Masternode</span>
              </Link>
              <Link className="menu-mobile__item" to="/coin">
                <img className="menu-mobile__icon" src="/img/Market-icon@2x.png" />
                <span className="menu-mobile__item-label" >Coin Info</span>
              </Link>
              {/*
              <Link className="menu-mobile__item" to="/faq">
                <img className="menu-mobile__icon" src="/img/Jobs-icon@2x.png" />
                <span className="menu-mobile__item-label">FAQ</span>
              </Link>
              */}
              <Link className="menu-mobile__item" to="/api">
                <img className="menu-mobile__icon" src="/img/Support-icon@2x.png" />
                <span className="menu-mobile__item-label">API</span>
              </Link>
            </div>
        </div>
      </div>
    )
  }
}
