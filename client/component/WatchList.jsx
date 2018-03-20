
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import Icon from './Icon';

export default class WatchList extends Component {
  static defaultProps = {
    title: 'Watch List',
  };

  static propTypes = {
    items: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onSearch: PropTypes.func.isRequired,
    title: PropTypes.string
  };

  handleClick = (ev, term) => {
    try {
      ev.preventDefault();
      this.props.onSearch(term);
    } catch(err) {
      // Do nothing.
    }
  };

  getWatchItems() {
    const { items } = this.props;

    const watchItems = items.map((item, idx) => {
      return (
        <a
          className="watch-list__item"
          key={ idx }
          onClick={ ev => this.handleClick(ev, item) }>
          <Icon name="chevron-circle-right"
                className="watch-list__item-close" />
          <span className="watch-list__item-text">
            { item }
          </span>
        </a>
      )
    });

    return watchItems
  };

  render() {
    const { props } = this;

    return (
      <Card title={ props.title } className="watch-list" >
        { this.getWatchItems() }
      </Card>
    );
  };
}
