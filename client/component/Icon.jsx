
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
const Icon = (props) => (
  <i className="material-icons">{ props.name }</i>
);

Icon.propTypes = {
  name: PropTypes.string.isRequired
};

export default Icon;
