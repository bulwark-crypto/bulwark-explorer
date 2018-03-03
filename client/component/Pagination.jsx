
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

/**
 * Setup pagination with provided current page
 * and total number of pages.
 * @param {Object} props The props for component.
 */
export default class Pagination extends Component {
  static propTypes = {
    current: PropTypes.number.isRequired,
    onPage: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired
  };

  handleOlder = (ev) => {
    ev.preventDefault();
    if (this.props.current < this.props.total) {
      this.props.onPage(this.props.current + 1);
    }
  };

  handleNewer = (ev) => {
    ev.preventDefault();
    if (this.props.current > 1) {
      this.props.onPage(this.props.current - 1);
    }
  };

  handlePage = (ev, page) => {
    ev.preventDefault();
    this.props.onPage(page);
  };

  render() {
    const gap = 3;
    const pages = [];
    let start = this.props.current - gap;
    let end = this.props.current + gap;

    if (start < 1) {
      start = 1;
    }
    if (end > this.props.total) {
      end = this.props.total;
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(
        <li className={ `page-item ${ i === this.props.current ? ' active' : '' }` } key={ i }>
          <a className="page-link" href="#" onClick={ (ev) => this.handlePage(ev, i) }>
            { i }
          </a>
        </li>
      );
    }

    return (
      <ul className={ `pagination${ this.props.className ? ` ${ this.props.className }` : '' }` }>
        <li className="page-item">
          <a className="page-link" href="#" onClick={ (ev) => this.handlePage(ev, 1) }>
            <Icon name="angle-double-left" />
          </a>
        </li>
        <li className="page-item">
          <a className="page-link" href="#" onClick={ this.handleNewer }>
            <Icon name="angle-left" />
          </a>
        </li>
        { pages }
        <li className="page-item">
          <a className="page-link" href="#" onClick={ this.handleOlder }>
            <Icon name="angle-right" />
          </a>
        </li>
        <li className="page-item">
          <a className="page-link" href="#" onClick={ (ev) => this.handlePage(ev, this.props.total) }>
            <Icon name="angle-double-right" />
          </a>
        </li>
      </ul>
    );
  }
};
