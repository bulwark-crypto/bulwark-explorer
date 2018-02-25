
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
const SearchBar = (props) => (
  <div className="search">
    <Icon name="search" className="search__icon" />
    <input
      className="search__input"
      placeholder="You may enter a block height, block hash, tx hash or address and hit enter." />
  </div>
);

SearchBar.propTypes = {
  title: PropTypes.string
};

export default SearchBar;
