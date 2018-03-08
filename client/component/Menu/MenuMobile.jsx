
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

import Icon from '../Icon';

export default class MenuDesktop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    }
  }

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const { state } = this;

    return (
      <div className="menu-mobile">
        <Navbar>
          {/*<SearchBar />*/}
          <NavbarToggler onClick={ this.handleToggle } className="mr-2" />
          <Collapse isOpen={ !state.isOpen } navbar>
            <Nav navbar>
              <NavItem>
                <NavLink href="/components/">Components</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap">Github</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    )
  }
}
