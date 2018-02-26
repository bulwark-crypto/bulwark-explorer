
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';
import Icon from './Icon';

export default class WatchList extends Component {
  static defaultProps = {
    title: 'Watch List',
  };

  static propTypes = {
    loading: PropTypes.bool,
    items: PropTypes.array,
    title: PropTypes.string
  };

  getWatchItems() {
    const { items } = this.props;

    const watchItems = items.map((item, idx) => {
      return (
        <div className="watch-list__item">
          <Icon name="times-circle"
                className="watch-list__item-close"
                onClick={ this.removeWatchItem(idx) }/>
          <span className="watch-list__item-text">
            { item }
          </span>
        </div>
      )
    });

    return watchItems
  }

  removeWatchItem(idx) {
    //debugger;
  }

  render() {
    const { props } = this;

    return (
      <Card title={ props.title } className="watch-list" >
        { this.getWatchItems() }
      </Card>
    );
  };
}
