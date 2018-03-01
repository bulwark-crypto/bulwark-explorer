
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
const HorizontalRule = (props) => (
  <div className="hr">
    <span className="hr__title">{ props.title }</span>
    <div className="hr__wrapper">
      <hr />
    </div>
  </div>
);

HorizontalRule.propTypes = {
  title: PropTypes.string
};

export default HorizontalRule;
