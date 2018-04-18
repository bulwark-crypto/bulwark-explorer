
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';

export default class MenuDesktop extends Component {
  static propTypes = {
    links: PropTypes.array
  };

  static defaultProps = {
    links: []
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    }
  }

  getLinks = () => {
    const { props, state } = this;

    return props.links.map((i, idx) => {
      const isActive = (props.location.pathname === i.href);
      const iconSource = i.icon.split('.svg')[0] + '_white.svg';

      return (
        <Link
          key={ idx }
          className={ `menu-desktop__item ${ isActive? 'menu-desktop__item--is-active' : '' }` }
          to={ i.href }>
          <img
            alt={ i.label }
            className="menu-desktop__item-icon"
            src={ iconSource }
            title={ this.state.isOpen ? null : i.label } />
          <span className="menu-desktop__item-label" >{ i.label }</span>
          <Icon name="caret-left" className="menu-desktop__item-indicator" />
        </Link>
      )
    }
    )
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (
      <div className={ `menu-desktop ${ this.state.isOpen ? 'menu-desktop--open' : 'menu-desktop--close' }` }>
        <div className="menu-desktop__content-wrapper">
          <div className="menu-desktop__header">
            <img src="/img/whitelogo.svg" className="menu-desktop__logo" />
            <a onClick={ this.handleToggle } >
              <Icon name="bars" className="menu-desktop__toggle" onClick={ this.handleToggle } />
            </a>
          </div>
          <p className="menu-desktop__title">MENU</p>
          { this.getLinks() }
        </div>
      </div>
    )
  }
}
