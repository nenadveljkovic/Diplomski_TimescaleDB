import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Map } from './components/Map';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
        <div>
            <Route exact path='/' component={Map} />
            <Route path='/conditions/:deviceName' component={Layout} />
        </div>
    );
  }
}
