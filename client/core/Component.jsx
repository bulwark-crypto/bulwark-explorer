
import React from 'react';

import ErrorBlock from '../component/ErrorBlock';
import Loading from '../component/Loading';

export default class Component extends React.Component {
  /**
   * Generate a random string.
   */
  randomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  /**
   * Render the provided error for the component.
   */
  renderError = (err) => (<ErrorBlock error={ err } />);

  /**
   * Render the loading indicator.
   */
  renderLoading = () => (<Loading />);
}
