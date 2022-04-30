import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Map } from './components/Map';
import { Conditions } from './components/Conditions';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
        //<Layout />
        <div>
            <Route exact path='/' component={Map} />
            <Route path='/conditions' component={Conditions} />
        </div>
    );
  }
}
