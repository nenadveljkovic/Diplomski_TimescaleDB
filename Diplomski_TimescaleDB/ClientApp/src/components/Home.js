import React, { Component } from 'react';
import { Conditions } from './Conditions.js';

export class Home extends Component {
  static displayName = Home.name;
    
  render () {
      return (
          <Conditions />
    );
  }
}
