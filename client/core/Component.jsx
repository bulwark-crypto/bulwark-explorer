
import React from 'react';

export default class Component extends React.Component {
  /**
   * Generate a random string.
   */
  randomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
}
