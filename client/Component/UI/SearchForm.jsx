
import {
    Button,
    Form,
    FormGroup,
    Input
} from 'reactstrap';
import Component from '../../Core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class UISearchForm extends Component {
    static propTypes = {
        onSearch: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            term: ''
        };
    };

    handleChange = ({ target }) => this.setState({ term: target.value });

    handleSubmit = () => {
        if (!this.state.term) {
            this.focusInputByName('term');
            return;
        }

        this.props
            .onSearch(this.state.term)
            .then(() => {
                this.focusInputByName('term');
                this.setState({ term: '' });
            });
    };

    render() {
        return (
            <Form className="search-form" inline>
                <FormGroup className="mr-2">
                    <Input
                        bsSize="sm"
                        placeholder="Enter a block height, block hash, tx hash or address"
                        name="term"
                        onChange={ this.handleChange }
                        onKeyPress={ (ev) => {
                            if (ev.key === 'Enter') {
                                ev.preventDefault();
                                this.handleSubmit();
                                return false;
                            }
                        } }
                        type="text"
                        value={ this.state.term } />
                </FormGroup>
                <Button onClick={ this.handleSubmit } size="sm">Search</Button>
            </Form>
        );
    };
}