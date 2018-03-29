
import Component from '../../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
const TableHeader = (props) => {
    const cells = props.cols.map((col, idx) => {
      if (typeof col === 'object') {
        col = col.title;
      }

      return (
        <th key={ idx } >{ col }</th>
      )
    });

    return (
      <thead>
        <tr>
          { cells }
        </tr>
      </thead>
    );
};

TableHeader.propTypes = {
  cols: PropTypes.array
};

export default TableHeader;
