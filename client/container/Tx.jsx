
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTX from '../component/Card/CardTX';
import CardTXIn from '../component/Card/CardTXIn';
import CardTXOut from '../component/Card/CardTXOut';
import HorizontalRule from '../component/HorizontalRule';

class TX extends Component {
  static propTypes = {
    getTX: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { tx: {}, vin: [], vout: [] };
  };

  componentDidMount() {
    this.getTX();
  };

  componentDidUpdate() {
    const { params: { hash } } = this.props.match;
    if (!!this.state.tx.hash
      && hash !== this.state.tx.hash
      && hash !== this.state.tx.height.toString()) {
      this.getTX();
    }
  };

  getTX() {
    this.props
      .getTX(this.props.match.params.hash)
      .then(({ tx, vin, vout }) => this.setState({ tx, vin, vout }));
  };

  render() {
    return (
      <div>
        <HorizontalRule title="Transaction Info" />
        <CardTX height={ this.props.tx.height } tx={ this.state.tx } />
        <div className="row">
          <div className="col">
            <HorizontalRule title="Sending Addresses" />
            <CardTXIn txs={ this.state.txs } />
          </div>
          <div className="col">
            <HorizontalRule title="Recipients" />
            <CardTXOut txs={ this.state.txs } />
          </div>
        </div>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTX: query => Actions.getTX(query)
});

const mapState = state => ({
  tx: state.txs.length
    ? state.txs[0]
    : { height: state.coin.blocks }
});

export default connect(mapState, mapDispatch)(TX);
