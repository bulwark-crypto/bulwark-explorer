
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
import { Route, Switch } from 'react-router-dom';

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
                            <i className="material-icons">menu</i>
                        </a>
                        <NavbarBrand href="/">
                            <img src="/img/logo.jpg" title="Bulwark Block Explorer" />
                        </NavbarBrand>
                    </div>
                    <NavbarToggler onClick={ this.handleToggle } />
                    <Collapse isOpen={ this.state.isOpen } navbar>
                        <div className="text-white ml-3">
                            <Switch>
                                <Route exact path="/" component={ () => "Overview" } />
                                <Route exact path="/api" component={ () => "API" } />
                                <Route exact path="/block" component={ () => "Block" } />
                                <Route exact path="/network" component={ () => "Network" } />
                                <Route exact path="/tx" component={ () => "TX" } />
                            </Switch>
                        </div>
                        <Nav className="ml-auto" navbar>
                            <SearchForm onSearch={ this.handleSearch } />
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    };
}