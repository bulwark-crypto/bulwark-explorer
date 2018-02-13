
import Component from '../../Core/Component';
import { Nav, NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import React from 'react';

export default class UISidenav extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired
    };

    render() {
        return (
            <nav className={ `sidenav ${ this.props.isOpen ? 'open' : 'close'}` }>
                <h6>MENU</h6>
                <Nav vertical>
                    <NavItem>
                        <NavLink className="active" href="#">
                            <i className="material-icons">home</i> Overview
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#">
                            <i className="material-icons">equalizer</i> Transactions
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#">
                            <i className="material-icons">star</i> Network
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#">
                            <i className="material-icons">group</i> Top 100
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#">
                            <i className="material-icons">assessment</i> Statistics
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#">
                            <i className="material-icons">info</i> API
                        </NavLink>
                    </NavItem>
                </Nav>
            </nav>
        );
    };
}