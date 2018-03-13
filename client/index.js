
import 'babel-polyfill';
import './theme.scss';
import { createStore } from 'redux';
import Promise from 'bluebird';
import { Provider } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';

import App from './App';
import Reducers from './core/Reducers';

// Setup the redux store.
const store = createStore(Reducers);

render(
  (<Provider store={ store }>
    <App />
  </Provider>),
  document.getElementById('react-app')
);
