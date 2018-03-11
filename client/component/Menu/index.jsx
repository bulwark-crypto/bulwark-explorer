
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';

import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import menuData from './menuData';


class Menu extends Component {
  render() {
    return (
      <div className="menu-wrapper">
        <MenuMobile links={ menuData } />
        <MenuDesktop links={ menuData } location={ this.props.location } />
      </div>
    )
  }
}

export default withRouter(Menu);

