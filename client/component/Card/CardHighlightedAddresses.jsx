
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import Icon from './Icon';

export default class CardHighlightedAddresses extends Component {
  static defaultProps = {
    title: 'Highlighted Addresses',
  };

  static propTypes = {
    items: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onSearch: PropTypes.func.isRequired,
    title: PropTypes.string
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
        <div className="animated fadeIn" key={ idx }>
          <div className="watch-list__item back-green">
            <div>
              <Icon name="check-circle" className="far watch-list__item-close"  />
            </div>
            <div onClick={ ev => this.handleClick(ev, item) } >
              <div className="watch-list__item-text">
                <h4
                className="text-center text-white"
                style={{
                  fontSize: '22px',
                  height: '22px',
                  lineHeight: '20px'
                }}>
                  { item }
                </h4>
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
        <p className="watch-list__title">{ `Search History (${ props.items.length }) `}</p>
        { this.getWatchItems() }
      </div>
    );
  };
}
