import React, { Component, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { ThreeDots } from 'react-loader-spinner';

export function Map(props) {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [devices, setDevices] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch('api/weatherconditions/getdevices');
            const json = await data.json();
            setDevices(json);
            setSelectedDevice(json[0].device_id);
        }
        trackPromise(fetchData().catch(console.error));
    }, []);
    return (
        <MapContainer center={[43.32472, 21.90333]} zoom={9}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[43.32472, 21.90333]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                  </Popup>
            </Marker>
        </MapContainer>
    );
}