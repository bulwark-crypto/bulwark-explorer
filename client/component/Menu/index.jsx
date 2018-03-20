
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';

import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import menuData from './menuData';


class Menu extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  };

  render() {
    return (
      <div className="menu-wrapper">
        <MenuMobile links={ menuData } onSearch={ this.props.onSearch } />
        <MenuDesktop links={ menuData } location={ this.props.location } />
      </div>
    )
  }
}

export default withRouter(Menu);

