
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class Card extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  componentDidMount() {
  };

  componentWillUnmount() {
  };

  render() {
    const { props } = this;

    return (
      <div className="card">
        <p className="card__title">
          { props.title }
        </p>
        {props.children}
      </div>
    );
  };
}
