import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import { Route } from 'react-router';
import { Conditions } from './Conditions'

export class Layout extends Component {
  static displayName = Layout.name;

  render () {
    return (
      <div>
        <NavMenu />
        <Container>
            
        </Container>
      </div>
    );
  }
}
