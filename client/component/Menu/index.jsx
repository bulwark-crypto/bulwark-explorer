
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
    isOpen: PropTypes.bool,
    handleToggle: PropTypes.func,
  };

  render() {
    const { props } = this;

    return (
      <div>
        <MenuDesktop { ...props } />
        {/*<MenuMobile { ...props } />*/}
      </div>
    )
  }
}
