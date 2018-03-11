
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

import Icon from '../Icon';
import SearchBar from '../SearchBar';

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
      <div className={ `menu-mobile ${ this.state.show ? 'menu-mobile--open' : 'menu-mobile--close' }` }>
        <div className="menu-mobile__search-wrapper">
          <SearchBar className="search--mobile mr-3" placeholder="Search Blockchain" />
          <a onClick={ this.handleToggle } >
            <Icon name="bars" className="menu-mobile__toggle" onClick={ this.handleToggle } />
          </a>
        </div>
        <div className="menu-mobile__item-wrapper" >
          <Link className="menu-mobile__item" to="/">
            <img className="menu-mobile__icon" src="/img/home.svg" />
            <span className="menu-mobile__item-label" >Overview</span>
          </Link>
          <Link className="menu-mobile__item" to="/movement">
            <img className="menu-mobile__icon" src="/img/movement.svg" />
            <span className="menu-mobile__item-label" >Movement</span>
          </Link>
          {/*
          <Link className="menu-mobile__item" to="/top">
            <img className="menu-mobile__icon" src="/img/top100.svg" />
            <span className="menu-mobile__item-label">Top 100</span>
          </Link>
          */}
          <Link className="menu-mobile__item" to="/masternode">
            <img className="menu-mobile__icon" src="/img/masternodes.svg" />
            <span className="menu-mobile__item-label">Masternode</span>
          </Link>
          <Link className="menu-mobile__item" to="/coin">
            <img className="menu-mobile__icon" src="/img/coininfo.svg" />
            <span className="menu-mobile__item-label" >Coin Info</span>
          </Link>
          {/*
          <Link className="menu-mobile__item" to="/faq">
            <img className="menu-mobile__icon" src="/img/Jobs-icon@2x.png" />
            <span className="menu-mobile__item-label">FAQ</span>
          </Link>
          <Link className="menu-mobile__item" to="/api">
            <img className="menu-mobile__icon" src="/img/api.svg" />
            <span className="menu-mobile__item-label">API</span>
          </Link>
          */}
        </div>
      </div>
    )
  }
}
