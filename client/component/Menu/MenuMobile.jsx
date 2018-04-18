
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';
import SearchBar from '../SearchBar';

export default class MenuMobile extends Component {
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
    const { props } = this;

    return props.links.map((i, idx) => {
      return (
        <Link key={ idx } className="menu-mobile__item" to={ i.href } onClick={ this.handleToggle } >
          <img
            alt={ i.label }
            className="menu-mobile__icon"
            src={ i.icon }
            title={ this.state.isOpen ? null : i.label } />
          <span className="menu-mobile__item-label" >{ i.label }</span>
        </Link>
      )
    })
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    return (
      <div className={ `menu-mobile ${ this.state.isOpen ? 'menu-mobile--open' : 'menu-mobile--close' }` }>
        <div className="menu-mobile__search-wrapper">
          <SearchBar
            className="search--mobile mr-3"
            onSearch={ this.props.onSearch }
            placeholder="Search Blockchain" />
          <a onClick={ this.handleToggle } >
            <Icon name="bars" className="menu-mobile__toggle" onClick={ this.handleToggle } />
          </a>
        </div>
        <div className="menu-mobile__item-wrapper" >
          { this.getLinks() }
        </div>
      </div>
    )
  }
}
