import React, { Component, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { ThreeDots } from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

export function Map(props) {
    const { promiseInProgress } = usePromiseTracker();
    const [devices, setDevices] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch('api/weatherconditions/getdevices');
            const json = await data.json();
            setDevices(json);           
        }
        trackPromise(fetchData().catch(console.error));
    }, []);
    const history = useHistory();
    if (promiseInProgress) {
        return (
            <div style={{
                width: "100%",
                height: "100",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }}>
                <ThreeDots color="rgba(98, 182, 239,1)" height="100" width="100" />
            </div >
        );
    }
    else {
        return (
            <MapContainer center={[43.32472, 21.90333]} zoom={9}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                    devices.map((device, idx) => (
                        <Marker position={[device.latitude, device.longitude]} key={device.device_id} eventHandlers={{
                            click: (e) => {
                                history.push(`/conditions/${device.device_name}`);
                            },
                        }}>
                            <Tooltip direction="top" offset={[-15.5, -6.5]}>
                                Uređaj:&nbsp;{device.device_name} <br />
                                Lokacija:&nbsp;{device.location} <br />
                                Sredina:&nbsp;{device.environment}
                            </Tooltip>
                        </Marker>                                                                    
                    ))
                }
            </MapContainer>
        );
    }    
}