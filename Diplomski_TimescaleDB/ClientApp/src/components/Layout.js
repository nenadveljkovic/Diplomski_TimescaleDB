import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import { Conditions } from './Conditions'
import { useParams } from 'react-router';

export function Layout () {

    let params = useParams();
    return (
      <div>
            <NavMenu />
            <Conditions deviceName={params.deviceName} />
      </div>
    );
}
