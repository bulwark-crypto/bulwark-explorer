
import Component from '../Core/Component';
import React from 'react';
import Table from '../Component/Table';

export default class Overview extends Component {
  state = {
    cols: ['height', 'hash', 'age', 'amount', 'recipients', 'time'],
    data: [
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
      {height: 70500, hash: '5891564sdaf456sdf5621dfs3sd5afd89a76asd2f1a3ew8597sdfa564sa1fsa3', age: 1, amount: 1, recipients: 1, time: Date.now()},
    ]
  }

  render() {
    const { cols, data } = this.state;

    return (
      <div>
        <h1>Overview</h1>
        <Table cols={ cols } data={ data } />
      </div>
    );
  };
}
