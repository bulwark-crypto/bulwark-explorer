
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
const Icon = (props) => (
  <span className={ `material-icons ${ props.className }` }>{ props.name }</span>
);

Icon.propTypes = {
  name: PropTypes.string.isRequired
};

export default Icon;
