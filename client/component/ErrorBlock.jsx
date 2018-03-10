
import PropTypes from 'prop-types';
import React from 'react';

const ErrorBlock = (props) => (
  <div className="error-danger">
    { props.error }
  </div>
);

ErrorBlock.propTypes = {
  error: PropTypes.string.isRequired
};

export default ErrorBlock;
