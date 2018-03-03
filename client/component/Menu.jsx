
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import Icon from './Icon';

export default class Menu extends Component {
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
      <div className={ `menu ${ props.isOpen ? 'menu--open' : 'menu--close' }` }>
        <div className="menu__wrapper">
          <div className="menu__header">
            <img src="/img/Badge-White.png" className="menu__logo" />
            <a onClick={ props.handleToggle } >
              <Icon name="bars" className="menu__toggle" onClick={ props.handleToggle } />
            </a>
          </div>
          <p className="menu__title">MENU</p>
            <Link className="menu__item" to="/">
              <img className="menu__icon" src="/img/Home-icon@2x.png" />
              <span className="menu__item-label" >Overview</span>
            </Link>
            <Link className="menu__item" to="/movement">
              <img className="menu__icon" src="/img/Analytics-icon@2x.png" />
              <span className="menu__item-label" >Movement</span>
            </Link>
            {/*
            <Link className="menu__item" to="/top">
              <img className="menu__icon" src="/img/Ratings-icon@2x.png" />
              <span className="menu__item-label">Top 100</span>
            </Link>
            */}
            <Link className="menu__item" to="/masternode">
              <img className="menu__icon" src="/img/Customers-icon@2x.png" />
              <span className="menu__item-label">Masternode</span>
            </Link>
            <Link className="menu__item" to="/coin">
              <img className="menu__icon" src="/img/Market-icon@2x.png" />
              <span className="menu__item-label" >Coin Info</span>
            </Link>
            {/*
            <Link className="menu__item" to="/faq">
              <img className="menu__icon" src="/img/Jobs-icon@2x.png" />
              <span className="menu__item-label">FAQ</span>
            </Link>
            */}
            <Link className="menu__item" to="/api">
              <img className="menu__icon" src="/img/Support-icon@2x.png" />
              <span className="menu__item-label">API</span>
            </Link>
          </div>
      </div>
    )
  }
}
