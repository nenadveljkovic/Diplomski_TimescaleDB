import React, { Component, useState, useEffect} from 'react';
import Chart from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';
import { MDBContainer } from "mdbreact";
import DropdownButton from 'react-bootstrap/DropdownButton';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Button from 'react-bootstrap/Button'; 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import { BsThermometerSun } from 'react-icons/bs';
import { GiSunRadiations } from 'react-icons/gi';
import { WiHumidity } from 'react-icons/wi';
import { FaWind } from 'react-icons/fa';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { ThreeDots } from 'react-loader-spinner';
import DatePicker from 'react-date-picker';


import './Conditions.css'

Chart.defaults.font.size = 14;
let temperature_line_chart_options = {
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: true
            }
        },
        y: {
            grid: {
                display: true,
                drawBorder: true
            }
        }
    },
    responsive: true,
    plugins: {
        tooltip: {
            displayColors: false,
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return context.dataset.label + ": " + context.formattedValue + ' \xB0C';
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
        },
        legend: {
            display: false
        }
    }
};

let windspeed_line_chart_options = {
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: true
            }
        },
        y: {
            grid: {
                display: true,
                drawBorder: true
            }
        }
    },
    responsive: true,
    plugins: {
        tooltip: {
            displayColors: false,
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return context.dataset.label + ": " + context.formattedValue + " km/h";
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
        },
        legend: {
            display: false
        }
    }
};

let humidity_bar_chart_options = {
    scales: {
        x: {
            grid: {
                display: true,
                drawBorder: true
            }
        },
        y: {
            grid: {
                display: false,
                drawBorder: true
            }
        }
    },
    responsive: true,
    plugins: {
        tooltip: {
            displayColors: false,
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return context.dataset.label + ": " + context.formattedValue + " %";
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
        },
        legend: {
            display: false
        }
    }
};

let uvindex_bar_chart_options = {
    scales: {
        x: {
            grid: {
                display: true,
                drawBorder: true
            }
        },
        y: {
            grid: {
                display: false,
                drawBorder: true
            }
        }
    },
    responsive: true,
    plugins: {
        tooltip: {
            displayColors: false,
            bodyFont: {
                weight: "bold"
            },
            callbacks: {    
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
        },
        legend: {
            display: false
        }
    }
};
const datum = {
    fontSize: '20px',
    display: 'inline-flex',
    flexFlow: 'row nowrap',
    minHeight: '50px',
    maxWidth: '50px',
    alignItems: 'center',
    justifyContent: 'space-between'
};

export function Conditions(props){
    const [dataLineTemperature, setdataLineTemperature] = useState({
        labels: [],
        datasets: [
            {
                label: "Temperatura",
                fill: true,
                lineTension: 0.3,
                backgroundColor: "rgba(255, 204, 0, .3)",
                borderColor: "rgb(255, 153, 0)",
                borderCapStyle: "butt",
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: "miter",
                pointBackgroundColor: "rgb(255, 153, 0)",
                pointBorderWidth: 10,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgb(0, 0, 0)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: []
            }
        ]
    });
    const [dataLineWindSpeed, setdataLineWindSpeed] = useState({
        labels: [],
        datasets: [
            {
                label: "Brzina vetra",
                fill: true,
                lineTension: 0.3,
                backgroundColor: "rgba(169, 169, 169, .3)",
                borderColor: "rgb(128,128,128)",
                borderCapStyle: "butt",
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: "miter",
                pointBackgroundColor: "rgb(128,128,128)",
                pointBorderWidth: 10,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgb(0, 0, 0)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: []
            }
        ]
    });
    const [dataBarHumidity, setdataBarHumidity] = useState({
        labels: [],
        datasets: [
            {
                label: "Vlažnost vazduha",
                data: [],
                backgroundColor: "rgba(98,  182, 239,0.4)",
                borderWidth: 2,
                borderColor: "rgba(98,  182, 239,1)"
            }
        ]
    });
    const [dataBarUV, setdataBarUV] = useState({
        labels: [],
        datasets: [
            {
                label: "UV indeks",
                data: [],
                backgroundColor: [],
                borderWidth: 2,
                borderColor: []
            }
        ]
    });
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
    const [selectedCondition, setSelectedCondition] = useState([true, false, false, false]);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [conditions, setConditions] = useState([]);
    const [rangeChanged, setRangeChanged] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            const fromdate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
            const todate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;
            const data = await fetch(`api/weatherconditions/getconditions/${selectedDevice}/${fromdate}/${todate}`);
            const json = await data.json();
            setConditions(json);
        }
        trackPromise(fetchData().catch(console.error));
    }, [rangeChanged]);
    useEffect(() => {
        const updateChartData = () => {
            setdataLineTemperature((prev) => ({
                ...prev,
                labels: conditions.map(v => v.time.substring(0, 10) + ' ' + v.time.substring(11,16)),
                datasets: [{
                    ...prev.datasets[0],
                    data: conditions.map(v => v.temperature)
                }]
            }));
            setdataLineWindSpeed((prev) => ({
                ...prev,
                labels: conditions.map(v => v.time.substring(0, 10) + ' ' + v.time.substring(11, 16)),
                datasets: [{
                    ...prev.datasets[0],
                    data: conditions.map(v => v.windspeed)
                }]
            }));
            setdataBarHumidity((prev) => ({
                ...prev,
                labels: conditions.map(v => v.time.substring(0, 10) + ' ' + v.time.substring(11, 16)),
                datasets: [{
                    ...prev.datasets[0],
                    data: conditions.map(v => v.humidity)
                }]
            }));
            setdataBarUV((prev) => ({
                ...prev,
                labels: conditions.map(v => v.time.substring(0, 10) + ' ' + v.time.substring(11, 16)),
                datasets: [{
                    ...prev.datasets[0],
                    data: conditions.map(v => v.uvindex),
                    backgroundColor: conditions.map(v => {
                        if (v.uvindex < 3)
                            return "rgb(40, 180, 99, 0.4)"
                        else if (v.uvindex < 6)
                            return "rgb(241, 196, 15, 0.4)"
                        else if (v.uvindex < 8)
                            return "rgb(211, 84, 0, 0.4)"
                        else if (v.uvindex < 11)
                            return "rgb(169, 50, 38, 0.4)"
                        else
                            return "rgb(91, 44, 111, 0.4)"
                    }),
                    borderColor: conditions.map(v => {
                        if (v.uvindex < 3)
                            return "rgb(40, 180, 99, 1)"
                        else if (v.uvindex < 6)
                            return "rgb(241, 196, 15, 1)"
                        else if (v.uvindex < 8)
                            return "rgb(211, 84, 0, 1)"
                        else if (v.uvindex < 11)
                            return "rgb(169, 50, 38, 1)"
                        else
                            return "rgb(91, 44, 111, 1)"
                    })
                }]
            }));
        }
        updateChartData();
    }, [conditions]);
    const { promiseInProgress } = usePromiseTracker();
    const radios = [
        { name: 'Temperatura', value: '0' },
        { name: 'Vlažnost vazduha', value: '1' },
        { name: 'Brzina vetra', value: '2' },
        { name: 'UV indeks', value: '3' }
    ];

    const setRadioValue = (value) => {
        setSelectedCondition((prev) => {
            return prev.map((sc, ind) => ind === Number(value) ? true:false);
        });        
    };
    const setDropdownValue = (value) => {
        setSelectedDevice(value)
    };
    const handleButtonClick = (value) => {
        setRangeChanged(!rangeChanged);
    };

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

            <Container>               
                <Row>
                    <Col sm={2}>
                    </Col>
                    <Col sm={8}>
                        Prikaz podataka za period od
                        <DatePicker value={fromDate} onChange={setFromDate} />
                        do <DatePicker value={toDate} onChange={setToDate} />
                        <Button variant="primary" size="sm" onClick={(e) => handleButtonClick(e.target.value)}>Prikaži</Button>
                    </Col>
                    <Col sm={2}>
                    </Col>
                </Row>
                <Row>
                    <Col sm={2}>
                    </Col>
                    <Col sm={2}>
                        <DropdownButton id="dropdown-basic-button" title="Uređaj" onSelect={setDropdownValue}>
                            {
                                devices.map((device, idx) => (
                                    <Dropdown.Item
                                        key={idx}
                                        eventKey={device.device_id}
                                        active={device.device_id === selectedDevice ? true : false}>
                                        {device.device_id} - {device.location}
                                    </Dropdown.Item>
                                ))}
                        </DropdownButton>
                    </Col>
                    <Col sm={8}>
                        <Container>
                            <ToggleButtonGroup name="radio" type="radio" size="sm">
                                {
                                    radios.map((radio, idx) => (
                                        <ToggleButton
                                            className="btn"
                                            key={idx}
                                            id={`radio-${idx}`}
                                            variant={selectedCondition[idx] ? 'primary' : 'outline-primary'}
                                            value={radio.value}
                                            onChange={(e) => setRadioValue(e.currentTarget.value)}
                                        >
                                            {radio.name}
                                        </ToggleButton>
                                    ))}
                            </ToggleButtonGroup>
                        </Container>
                    </Col>
                </Row>               
                <Row>
                    <Col>
                        {
                            selectedCondition[0]
                            &&
                            <Container>
                                <h3 className="mt-5"><BsThermometerSun /> Temperatura</h3>
                                <Line data={dataLineTemperature} options={temperature_line_chart_options} />
                            </Container>
                        }
                        {
                            selectedCondition[1]
                            &&
                            <Container>
                                <h3 className="mt-5"><WiHumidity /> Vlažnost vazduha</h3>
                                <Bar data={dataBarHumidity} options={humidity_bar_chart_options} />
                            </Container>
                        }
                        {
                            selectedCondition[2]
                            &&
                            <Container>
                                <h3 className="mt-5"><FaWind /> Brzina vetra</h3>
                                <Line data={dataLineWindSpeed} options={windspeed_line_chart_options} />
                            </Container>
                        }
                        {
                            selectedCondition[3]
                            &&
                            <Container>
                                <h3 className="mt-5"><GiSunRadiations /> UV indeks</h3>
                                <Bar data={dataBarUV} options={uvindex_bar_chart_options} />
                            </Container>
                        }
                    </Col>
                </Row>                
            </Container>
            );
    }  
}