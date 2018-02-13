
import React, { Component } from 'react';

export default class CoreComponent extends Component {
    focusInputByName = (name) => {
        document.querySelector(`input[name="${ name }"]`).focus();
    };

    render() {
        return null;
    };
}