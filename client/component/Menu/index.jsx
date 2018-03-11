
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import menuData from './menuData';


export default class Menu extends Component {
  render() {
    return (
      <div className="menu-wrapper">
        <MenuMobile links={ menuData } />
        <MenuDesktop links={ menuData } />
      </div>
    )
  }
}
