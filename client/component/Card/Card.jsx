
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class Card extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    const getCardTitle = () => {
      if (!props.title) {
        return null;
      }
      return <p className="card__title">
        {props.title}
      </p>
    }
    return (
      <div
        className={`card ${props.className ? props.className : ''}`}
        style={!!props.style ? props.style : {}}>
        {getCardTitle()}
        <div className="card__body">
          {props.children}
        </div>
      </div>
    );
  };
}
