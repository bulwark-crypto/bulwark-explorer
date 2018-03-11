
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Link } from 'react-router-dom';

import Icon from '../Icon';
import SearchBar from '../SearchBar';

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
        <Link className="menu-mobile__item" to={ i.href }>
          <img className="menu-mobile__icon" src={ i.icon } />
          <span className="menu-mobile__item-label" >{ i.label }</span>
        </Link>
      )
    })
  };

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

          { this.getLinks() }

        </div>
      </div>
    )
  }
}
