
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';

export default class Menu extends Component {
  render() {
    return (
      <div className="menu-wrapper">
        <MenuMobile />
        <MenuDesktop />
      </div>
    )
  }
}
