
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

  handleClose = (ev) => {
    alert('y');
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
        <span
          className="watch-list__item"
          key={ idx } >
          <Icon name="chevron-circle-right"
                className="watch-list__item-close" onClick={ this.handleClose } />
          <a onClick={ ev => this.handleClick(ev, item) } >
            <span className="watch-list__item-text">
              { item }
            </span>
          </a>
        </span>
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
