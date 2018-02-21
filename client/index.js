
import 'babel-polyfill';
import './theme.scss';
import { createStore } from 'redux';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';

import App from './App';
import Reducers from './core/Reducers';

// Setup the redux store.
const store = createStore(Reducers);

render(
  (<Provider store={ store }>
    <HashRouter>
        <App />
    </HashRouter>
  </Provider>),
  document.getElementById('react-app')
);
