
import Component from '../core/Component';
import config from '../../config';
import { isAddress, isBlock } from '../../lib/blockchain';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';

import Icon from './Icon';

class SearchBar extends Component {
  static defaultProps = {
    placeholder: 'You may enter a block height, block hash, tx hash or address and hit enter.',
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    placeholder: PropTypes.string.isRequired
  };

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();

      const term = ev.target.value;
      ev.target.value = '';

      if (!term) {
        return;
      } else if (isBlock(term)) {
        this.props.history.push(`/block/${ term }`);
      } else if (isAddress(term)) {
        this.props.history.push(`/address/${ term }`);
      } else {
        this.props.history.push(`/tx/${ term }`);
      }
    }
  };

  render() {
    const { props } = this;

    return (
      <div className={ `search ${ props.className ? props.className : '' }` } >
        <Icon name="search" className="search__icon" />
        <input
          className="search__input"
          onKeyPress={ this.handleKeyPress }
          placeholder={ props.placeholder } />
      </div>
    );
  };
}

export default withRouter(SearchBar);
