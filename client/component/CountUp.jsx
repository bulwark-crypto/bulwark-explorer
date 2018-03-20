import Component from 'core/Component';
import React from 'react';
import CountUpComponent from 'react-countup';

export default class CountUp extends Component {
  render() {
    const { props } = this;

    return(
      <CountUpComponent { ...props } />
    )
  }
}

