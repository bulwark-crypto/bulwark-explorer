
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 * @todo accept array of selectboxes instead
 */
const HorizontalRule = (props) => {

  /**
   * You can pass array of selects now instead of hardcoding date/filter select
   */
  const getSelects = () => {
    if (!props.selects) {
      return null;
    }
    var selectElements = [];
    props.selects.forEach((select, index) => {
      selectElements.push(<div key={index} className="hr__select">{select}</div>);
    })
    return selectElements;
  }

  return (
    <div className={`hr ${props.className ? props.className : ''}`} >
      <span className="hr__title">{props.title}</span>
      <div className="hr__wrapper">
        <hr />
      </div>
      {!!props.dateSelect && <div className="hr__select">
        {props.dateSelect}
      </div>}
      {!!props.filterSelect && <div className="hr__select">
        {props.filterSelect}
      </div>}
      {!!props.select && <div className="hr__select">
        {props.select}
      </div>}
      {getSelects()}
    </div>
  );
}

HorizontalRule.propTypes = {
  title: PropTypes.string
};

export default HorizontalRule;
