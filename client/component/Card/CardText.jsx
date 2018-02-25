
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';

export default class CardText extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    title: PropTypes.string
  };

  render() {
    const { props } = this;

    return (
      <Card title="props.title">
        <p>YOLO</p>
      </Card>
    );
  };
}
