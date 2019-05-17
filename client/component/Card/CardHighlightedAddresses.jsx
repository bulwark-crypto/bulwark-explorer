import PropTypes from 'prop-types';
import React from 'react';

import Component from '../../core/Component';
import Card from './Card';
import Icon from '../Icon';

export default class CardHighlightedAddresses extends Component {
  
  handleClick = (ev, term) => {
    /*
    try {
      this.props.onSearch(term);
    } catch(err) {
      // Do nothing.
    }*/
  };

  getWatchItems() {
    const { addresses } = this.props;

    const watchItems = addresses.map((item, idx) => {
      return (
        <div className="animated fadeIn" key={ idx } onClick={ ev => this.handleClick(ev, item) } >
          <div className="watch-list__item">
           
            <div>
              <div className="watch-list__item-text">
                { item.label }
              </div>
            </div>
          </div>
        </div>
      )
    });

    return watchItems
  };

  render() {
    const { props } = this;

    return (
      <div className="watch-list">
        <p className="watch-list__title">{ props.title }</p>
        { this.getWatchItems() }
      </div>
    )
  }
}