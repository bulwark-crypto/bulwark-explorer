
import Component from './Core/Component';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Container } from 'reactstrap';
import Navbar from './Component/UI/Navbar';
import Sidenav from './Component/UI/Sidenav';

import API from './Container/API';
import Block from './Container/Block';
import Network from './Container/Network';
import Overview from './Container/Overview';
import TX from './Container/Tx';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: true
        };
    };

    handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

    render() {
        return (
            <div>
                <Navbar onSide={ this.handleToggle } />
                <Container fluid={ true }>
                    <Sidenav isOpen={ this.state.isOpen } />
                    <div style={{ paddingLeft: this.state.isOpen ? 236 : 0 }}>
                        <Switch>
                            <Route exact path="/" component={ Overview } />
                            <Route exact path="/api" component={ API } />
                            <Route exact path="/block" component={ Block } />
                            <Route exact path="/network" component={ Network } />
                            <Route exact path="/tx" component={ TX } />
                        </Switch>
                    </div>
                </Container>
            </div>
        );
    };
}