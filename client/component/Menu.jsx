
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
            <img src="/img/logo.jpg" className="menu__logo" />
            <a onClick={ props.handleToggle } >
              <Icon name="bars" className="menu__toggle" onClick={ props.handleToggle } />
            </a>
          </div>
          <p className="menu__title">MENU</p>
            <Link className="menu__item" to="/">
              <Icon name="home" className="menu__icon" /> <span className="menu__item-label" >Overview</span>
            </Link>
            <Link className="menu__item" to="/movement">
              <Icon name="chart-bar" className="menu__icon" /> <span className="menu__item-label" >Movement</span>
            </Link>
            <Link className="menu__item" to="/top">
              <Icon name="star" className="menu__icon" /> <span className="menu__item-label">Top 100</span>
            </Link>
            <Link className="menu__item" to="/masternode">
              <Icon name="users" className="menu__icon" /> <span className="menu__item-label">Masternode</span>
            </Link>
            <Link className="menu__item" to="/coin">
              <Icon name="info" className="menu__icon" /> <span className="menu__item-label" >Coin Info</span>
            </Link>
            <Link className="menu__item" to="/faq">
              <Icon name="question" className="menu__icon" /> <span className="menu__item-label">FAQ</span>
            </Link>
            <Link className="menu__item" to="/api">
              <Icon name="database" className="menu__icon" /> <span className="menu__item-label">API</span>
            </Link>
          </div>
      </div>
    )
  }
}
