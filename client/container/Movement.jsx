
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTXs from '../component/Card/CardTXs';
import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Select from '../component/Select';

import { PAGINATION_PAGE_SIZE } from '../constants';

class Movement extends Component {
  static propTypes = {
    getTXs: PropTypes.func.isRequired,
    setTXs: PropTypes.func.isRequired,
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      txs: []
    };
  };

  componentDidMount() {
    this.getTXs();
  };

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };

  getTXs = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getTXs({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ pages, txs }) => {
            if (this.debounce) {
              this.setState({ pages, txs, loading: false }, () => {
                if (txs.length
                  && this.props.tx.blockHeight < txs[0].blockHeight) {
                  this.props.setTXs(txs);
                }
              });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
    });
  };

  handlePage = page => this.setState({ page }, this.getTXs);

  handleSize = size => this.setState({ size, page: 1 }, this.getTXs);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={ value => this.handleSize(value) }
        selectedValue={ this.state.size }
        options={ selectOptions } />
    );

    return (
      <div>
        <HorizontalRule
          select={ select }
          title="Movement" />
        <CardTXs txs={ this.state.txs } />
        <Pagination
          current={ this.state.page }
          className="float-right"
          onPage={ this.handlePage }
          total={ this.state.pages } />
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTXs: query => Actions.getTXs(null, query),
  setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = state => ({
  tx: state.txs.length ? state.txs[0] : {}
});

export default connect(mapState, mapDispatch)(Movement);
