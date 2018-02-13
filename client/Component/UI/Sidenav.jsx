
import Component from '../../Core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class UISidenav extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired
    };

    render() {
        return (
            <nav className={ `sidenav ${ this.props.isOpen ? 'open' : 'close'}` }>
                Sidenav
            </nav>
        );
    };
}