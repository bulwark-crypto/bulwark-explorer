
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';

export default class Menu extends Component {
  static defaultProps = {
    isOpen: true,
  };

  static propTypes = {
    handleToggle: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  render() {
    return (
      <div className="menu-wrapper">
        <MenuMobile { ...this.props } />
        <MenuDesktop { ...this.props } />
      </div>
    )
  }
}
