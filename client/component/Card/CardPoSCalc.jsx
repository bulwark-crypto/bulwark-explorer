
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import Icon from '../Icon';

export default class CardPoSCalc extends React.Component {
    constructor(props) {
        super(props);
        this.input = null;
    };

    handleClick = (ev) => {
        const v = this.input.value;
        console.log('PoS Calc:', v);

        if (!!v && !isNaN(v)) {
            document.location.href = `/#/pos/${ v }`;
        }
    };

    render() {
        return (
            <Card title="PoS Calculator">
                <div className="row">
                    <div className="col-sm-12">
                        <input onClick={ this.handleClick } type="text" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        Note: the following calculations are an estimation.  
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <button onClick={ this.handleClick } />
                    </div>
                </div>
            </Card>
        );
    };
}
