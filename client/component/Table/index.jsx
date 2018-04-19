
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import { Table } from 'reactstrap';

import TableHeader from './TableHeader';

export default class TableWrapper extends Component {
  static defaultProps = {
    cols: [],
    data: [],
    hasDivider: true,
  };

  static propTypes = {
    cols: PropTypes.array,
    data: PropTypes.array,
    max: PropTypes.number,
    hasDivider: PropTypes.bool,
  };

  componentDidMount() {
  };

  componentWillUnmount() {
  };

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

    const keys = cols.map(col => {
      return (typeof col === 'object') ? col.key : col;
    })

    return keys;
  }

  render() {
    const { props } = this;

    if (!props.data.length) {
      return false;
    }

    return (
      <div className="table-wrapper">
        <div className="table-wrapper__shadow-margin">
          <Table className={ `${ this.props.hasDivider ? 'table--has-divider' : '' } ${ this.props.className || 'animated fadeIn' }` }>
            <TableHeader cols={ props.cols } />
            { this.getBody() }
          </Table>
        </div>
      </div>
    );
  };
}
