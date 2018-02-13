
import {
    Button,
    Collapse,
    Form,
    FormGroup,
    Input,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import Component from '../../Core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import SearchForm from './SearchForm';

export default class UINavbar extends Component {
    static propTypes = {
        onSide: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };
    };

    handleSearch = (term) => {
        console.log('search:', term);
        return Promise.resolve();
    };

    handleSide = (ev) => {
        try { ev.preventDefault(); } catch(err) {}
        this.props.onSide();
    };

    handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

    render() {
        return (
            <div>
                <Navbar color="faded" expand="md">
                    <div className="navbar-border">
                        <a className="float-right" onClick={ this.handleSide }>
                            <i class="material-icons">menu</i>
                        </a>
                        <NavbarBrand href="/">Bulwark</NavbarBrand>
                    </div>
                    <NavbarToggler onClick={ this.handleToggle } />
                    <Collapse isOpen={ this.state.isOpen } navbar>
                        <Nav className="ml-auto" navbar>
                            <SearchForm onSearch={ this.handleSearch } />
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    };
}