
import 'babel-polyfill';
import './theme.scss';
import { HashRouter } from 'react-router-dom';
import React from 'react';
import { render } from 'react-dom';

import App from './App';

render(
  <HashRouter>
      <App />
  </HashRouter>,
  document.getElementById('react-app')
);
