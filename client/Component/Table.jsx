
import Component from '../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class Table extends Component {
  static defaultProps = {
    cols: [],
    data: [],
  };

  static propTypes = {
    cols: PropTypes.array,
    data: PropTypes.array,
    max: PropTypes.number,
  };

  componentDidMount() {
  };

  componentWillUnmount() {
  };

  getHeader() {
    const keys = this.getKeys();

    const cells = keys.map((col, idx) => {
      return (
        <th key={ idx }>{ col }</th>
      )
    });

    return (
      <thead>
        <tr>
          { cells }
        </tr>
      </thead>
    );
  }

  getBody() {
    const { data } = this.props;
    const keys = this.getKeys();

    const rows = data.map((row, idx) => {
      const cells = keys.map((col, i) => {
        return (
          <td key={ i }>{ row[col] }</td>
        )
      });

      return (
        <tr key={ idx }>
          { cells }
        </tr>
      )
    })

    return (
      <tbody>
        { rows }
      </tbody>
    );
  }

  getKeys() {
    const { cols } = this.props;

    if (typeof col === 'object') {
      // TODO allow for different titles than the object key
    }

    return [ ...cols ];
  }

  render() {
    const { cols, data } = this.props;

    return (
      <table>
        { this.getHeader() }
        { this.getBody() }
      </table>
    );
  };
}
