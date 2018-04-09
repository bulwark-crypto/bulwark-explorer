
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

  handleClose = (ev, term) => {
    this.props.onRemove(term);
  };

  handleClick = (ev, term) => {
    try {
      this.props.onSearch(term);
    } catch(err) {
      // Do nothing.
    }
  };

  getWatchItems() {
    const { items } = this.props;

    const watchItems = items.map((item, idx) => {
      return (
        <span
          className="watch-list__item"
          key={ idx } >
          <span onClick={ ev => this.handleClose(ev, item) }>
            <Icon name="times-circle"
              className="far watch-list__item-close"  />
          </span>
          <span onClick={ ev => this.handleClick(ev, item) } >
            <span className="watch-list__item-text">
              { item }
            </span>
          </span>
        </span>
      )
    });

    return watchItems
  };

  render() {
    const { props } = this;

    return (
      <div className="watch-list">
        <p className="watch-list__title">{ `Watch List (${ props.items.length }) `}</p>
        { this.getWatchItems() }
      </div>
    );
  };
}
