
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
      show: false
    }
  }

  getLinks = () => {
    const { links } = this.props;

    return links.map((i, idx) => {
      return (
        <Link key={ idx } className="menu-desktop__item" to={ i.href }>
          <img className="menu-desktop__icon" src={ i.icon } />
          <span className="menu-desktop__item-label" >{ i.label }</span>
        </Link>
      )
    })
  };

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

          { this.getLinks() }

        </div>
      </div>
    )
  }
}
