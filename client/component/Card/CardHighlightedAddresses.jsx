import PropTypes from 'prop-types';
import React from 'react';

import Component from '../../core/Component';
import Card from './Card';
import Icon from '../Icon';

export default class CardHighlightedAddresses extends Component {
  
  handleClick = (ev, term) => {
    try {
      this.props.onSearch(term.address);
    } catch(err) {
      // Do nothing.
    }
  };

  getHighlightedAddresses() {
    const highlightedAddresses = this.props.addresses.map((item, idx) => {
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

    return highlightedAddresses
  };

  render() {
    // Do not render anything if there are no addresses to highlight
    if (this.props.addresses.length == 0) {
      return null;
    }

    return (
      <div className="watch-list">
        <p className="watch-list__title">{ this.props.title }</p>
        { this.getHighlightedAddresses() }
      </div>
    )
  }
}