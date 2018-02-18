
import Component from '../Core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class Table extends Component {
    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th>One</th>
                        <th>Two</th>
                        <th>Three</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>A</td>
                        <td>B</td>
                        <td>C</td>
                    </tr>
                </tbody>
            </table>
        );
    };
}