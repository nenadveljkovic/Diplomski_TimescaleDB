﻿import React, { Component, useState, useEffect } from 'react';
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
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import { ThreeDots } from 'react-loader-spinner';
import DatePicker from 'react-date-picker';
import { Link } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';


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
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return "  Temperatura: " + context.formattedValue + ' \xB0C';
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
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
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return "  Brzina vetra: " + context.formattedValue + " km/h";
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
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
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return " Vlažnost vazduha: " + context.formattedValue + " %";
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
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
            bodyFont: {
                weight: "bold"
            },
            callbacks: {
                label: function (context) {
                    return " UV indeks: " + context.formattedValue;
                },
                title: function (context) {
                    return "Vreme: " + context[0].label + "h";
                }
            }
        }
    }
};

export function Conditions(props){
    const [dataLineTemperature, setdataLineTemperature] = useState({});
    const [dataLineWindSpeed, setdataLineWindSpeed] = useState({});
    const [dataBarHumidity, setdataBarHumidity] = useState({});
    const [dataBarUV, setdataBarUV] = useState({});
    const [devices, setDevices] = useState([]);
    const [selectedComparisonDevices, setselectedComparisonDevices] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedCondition, setSelectedCondition] = useState([true, false, false, false]);
    const [selectedAggregation, setSelectedAggregation] = useState([true, false, false, false,false]);
    const [selectedAggregationName, setSelectedAggregationName] = useState('Neobrađeni podaci');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [conditions, setConditions] = useState([]);
    const [rangeChangedRaw, setRangeChangedRaw] = useState(true);
    const [rangeChangedAvg, setRangeChangedAvg] = useState(true);
    const [rangeChangedMin, setRangeChangedMin] = useState(true);
    const [rangeChangedMax, setRangeChangedMax] = useState(true);
    const [rangeChangedMed, setRangeChangedMed] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch('api/weatherconditions/getdevices');
            const json = await data.json();
            setDevices(
                json.map(device => ({
                    name: device.device_name + ' - ' + device.location,
                    value: device.device_name
                })).filter(function (obj) {
                    return obj.value !== props.deviceName
                })
            );
            setColors(
                json.map(device => ({
                    'devicename': device.device_name,
                    'r': Math.floor(Math.random() * (255 + 1)),
                    'g': Math.floor(Math.random() * (255 + 1)),
                    'b': Math.floor(Math.random() * (255 + 1))
                }))
            );            
        }
        trackPromise(fetchData().catch(console.error));
    }, []);
    useEffect(() => {
        const fetchData = async (devicename) => {
            const fromdate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
            const todate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;
            const data = await fetch(`api/weatherconditions/getconditions/${devicename}/${fromdate}/${todate}`);
            const json = await data.json();
            if (json.length !== 0)
                setConditions((prev) => {
                    var newArray = [];
                    for (var i = 0; i < prev.length; i++)
                        newArray[i] = prev[i].slice();
                    newArray.push(json);
                    return newArray;
                });
        }
        trackPromise(fetchData(props.deviceName).catch(console.error));
        for (var i = 0; i < selectedComparisonDevices.length; i++)
            trackPromise(fetchData(selectedComparisonDevices[i].value).catch(console.error));
    }, [rangeChangedRaw]);
    useEffect(() => {
        const fetchData = async (devicename) => {
            const fromdate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
            const todate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;
            const data = await fetch(`api/weatherconditions/gethourlyavgconditions/${devicename}/${fromdate}/${todate}`);
            const json = await data.json();
            if (json.length !== 0)
                setConditions((prev) => {
                    var newArray = [];
                    for (var i = 0; i < prev.length; i++)
                        newArray[i] = prev[i].slice();
                    newArray.push(json);
                    return newArray;
                });
        }
        trackPromise(fetchData(props.deviceName).catch(console.error));
        for (var i = 0; i < selectedComparisonDevices.length; i++)
            trackPromise(fetchData(selectedComparisonDevices[i].value).catch(console.error));
    }, [rangeChangedAvg]);
    useEffect(() => {
        const fetchData = async (devicename) => {
            const fromdate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
            const todate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;
            const data = await fetch(`api/weatherconditions/gethourlyminconditions/${devicename}/${fromdate}/${todate}`);
            const json = await data.json();
            if (json.length !== 0)
                setConditions((prev) => {
                    var newArray = [];
                    for (var i = 0; i < prev.length; i++)
                        newArray[i] = prev[i].slice();
                    newArray.push(json);
                    return newArray;
                });
        }
        trackPromise(fetchData(props.deviceName).catch(console.error));
        for (var i = 0; i < selectedComparisonDevices.length; i++)
            trackPromise(fetchData(selectedComparisonDevices[i].value).catch(console.error));
    }, [rangeChangedMin]);
    useEffect(() => {
        const fetchData = async (devicename) => {
            const fromdate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
            const todate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;
            const data = await fetch(`api/weatherconditions/gethourlymaxconditions/${devicename}/${fromdate}/${todate}`);
            const json = await data.json();
            if (json.length !== 0)
                setConditions((prev) => {
                    var newArray = [];
                    for (var i = 0; i < prev.length; i++)
                        newArray[i] = prev[i].slice();
                    newArray.push(json);
                    return newArray;
                });
        }
        trackPromise(fetchData(props.deviceName).catch(console.error));
        for (var i = 0; i < selectedComparisonDevices.length; i++)
            trackPromise(fetchData(selectedComparisonDevices[i].value).catch(console.error));
    }, [rangeChangedMax]);
    useEffect(() => {
        const fetchData = async (devicename) => {
            const fromdate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
            const todate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`;
            const data = await fetch(`api/weatherconditions/gethourlymedconditions/${devicename}/${fromdate}/${todate}`);
            const json = await data.json();
            if (json.length !== 0)
                setConditions((prev) => {
                    var newArray = [];
                    for (var i = 0; i < prev.length; i++)
                        newArray[i] = prev[i].slice();
                    newArray.push(json);
                    return newArray;
                });
        }
        trackPromise(fetchData(props.deviceName).catch(console.error));
        for (var i = 0; i < selectedComparisonDevices.length; i++)
            trackPromise(fetchData(selectedComparisonDevices[i].value).catch(console.error));
    }, [rangeChangedMed]);
    useEffect(() => {
        const updateChartData = () => {
            var rarray = [];
            for (var i = 0; i < conditions.length; i++)
                for (var j = 0; j < conditions[i].length; j++)
                    if (!rarray.includes(Date.parse(conditions[i][j].time)))
                        rarray.splice(sortedIndex(rarray, Date.parse(conditions[i][j].time)), 0, Date.parse(conditions[i][j].time));
            var lbls = rarray.map(v => {
                var date = new Date(v);
                return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
            });
            setdataLineTemperature({
                labels: lbls,
                datasets: conditions.map((v, ind) => {
                    var color = colors.filter(function (obj) {
                        return obj.devicename === v[0].devicename
                    });
                     return {                       
                        lineTension: 0.3,                      
                         borderColor: "rgb(" + color[0].r + "," + color[0].g + "," + color[0].b + ")",
                        borderCapStyle: "butt",
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: "miter",
                         pointBackgroundColor: "rgb(" + color[0].r + "," + color[0].g + "," + color[0].b + ")",
                        pointBorderWidth: 10,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgb(0, 0, 0)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        label: v[0].devicename,
                        data: v.map(x=>x.temperature)
                     }                   
                })
            });
            setdataLineWindSpeed({
                labels: lbls,
                datasets: conditions.map((v, ind) => {
                    var color = colors.filter(function (obj) {
                        return obj.devicename === v[0].devicename
                    });
                    return {
                        lineTension: 0.3,
                        borderColor: "rgb(" + color[0].r + "," + color[0].g + "," + color[0].b + ")",
                        borderCapStyle: "butt",
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: "miter",
                        pointBackgroundColor: "rgb(" + color[0].r + "," + color[0].g + "," + color[0].b + ")",
                        pointBorderWidth: 10,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgb(0, 0, 0)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        label: v[0].devicename,
                        data: v.map(x => x.windspeed)
                    }
                })
            });
            setdataBarHumidity({
                labels: lbls,
                datasets: conditions.map((v, ind) => {
                    var color = colors.filter(function (obj) {
                        return obj.devicename === v[0].devicename
                    });
                    return {
                        backgroundColor: "rgba(" + color[0].r + "," + color[0].g + "," + color[0].b + ", .4)",
                        borderWidth: 2,
                        borderColor: "rgba(" + color[0].r + "," + color[0].g + "," + color[0].b + ", 1)",
                        label: v[0].devicename,
                        data: v.map(x => x.humidity)
                    }
                })
            });
            setdataBarUV({
                labels: lbls,
                datasets: conditions.map((v, ind) => {
                    var color = colors.filter(function (obj) {
                        return obj.devicename === v[0].devicename
                    });
                    return {
                        label: v[0].devicename,
                        data: v.map(x => x.uvindex),
                        backgroundColor: "rgba(" + color[0].r + "," + color[0].g + "," + color[0].b + ", .4)",
                        borderWidth: 2,
                        borderColor: "rgba(" + color[0].r + "," + color[0].g + "," + color[0].b + ", 1)",
                    }
                })                
            });
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
    const namesAggregation = [
         'Neobrađeni podaci',
         'Prosečne vrednosti po satima',
         'Minimalne vrednosti po satima',
         'Maksimalne vrednosti po satima',
         'Vrednosti medijane po satima',
    ];

    const setRadioValue = (value) => {
        setSelectedCondition((prev) => {
            return prev.map((sc, ind) => ind === Number(value) ? true:false);
        });        
    };    
    const setAggregationDropdownValue = (value) => {
        setSelectedAggregationName(value)       
    };
    const handleButtonClick = (value) => {
        setConditions([]);
        if (selectedAggregationName === 'Neobrađeni podaci')
            setRangeChangedRaw(!rangeChangedRaw);
        else if (selectedAggregationName === 'Prosečne vrednosti po satima')
            setRangeChangedAvg(!rangeChangedAvg);
        else if (selectedAggregationName === 'Minimalne vrednosti po satima')
            setRangeChangedMin(!rangeChangedMin);
        else if (selectedAggregationName === 'Maksimalne vrednosti po satima')
            setRangeChangedMax(!rangeChangedMax);
        else
            setRangeChangedMed(!rangeChangedMed);
        setSelectedCondition([true, false, false, false]);
        setSelectedAggregation((prev) => {
            return prev.map((sc, ind) => namesAggregation[ind] === selectedAggregationName ? true : false);
        });      
    };
    const onSelect = (selectedList) => {
        setselectedComparisonDevices(selectedList);
    };
    const onRemove = (selectedList) => {
        setselectedComparisonDevices(selectedList);
    };

    const sortedIndex = (array, value) => {
        var low = 0,
            high = array.length;

        while (low < high) {
            var mid = low + high >>> 1;
            if (array[mid] < value) low = mid + 1;
            else high = mid;
        }
        return low;
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
                    <Col>
                        <Link to="/">
                            <IoArrowBackCircleOutline style={{ fontSize: 40 }}/>
                        </Link>
                        <br />
                        <br />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Prikaz podataka za period od &nbsp;&nbsp;&nbsp;
                        <DatePicker value={fromDate} onChange={setFromDate} />
                        &nbsp;&nbsp;&nbsp;do&nbsp;&nbsp;&nbsp;
                        <DatePicker value={toDate} onChange={setToDate} />
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        Željeni prikaz:&nbsp;
                        <DropdownButton id="dropdown-basic-button" title={selectedAggregationName} onSelect={setAggregationDropdownValue} size="sm">
                            {
                                namesAggregation.map((aggregation, idx) => (
                                    <Dropdown.Item
                                        key={idx}
                                        eventKey={aggregation}
                                        active={selectedAggregationName === aggregation ? true : false}>
                                        {aggregation}
                                    </Dropdown.Item>
                                ))}
                        </DropdownButton> 
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        Uporedi sa:&nbsp;&nbsp;&nbsp;
                        <Multiselect
                            options={devices}
                            displayValue="name"
                            onSelect={onSelect}
                            onRemove={onRemove}
                            selectedValues={selectedComparisonDevices}
                            showCheckbox
                            placeholder="Selektuj uređaje za poređenje..."
                            hidePlaceholder
                            showArrow
                            style={{                               
                                inputField: {                              
                                    'minWidth': '300px'                                    
                                }
                            }}
                        />                       
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Button variant="primary" size="sm" onClick={(e) => handleButtonClick(e.target.value)}>Prikaži</Button>
                    </Col>
                </Row>
                {
                    conditions.length === 0
                    &&
                    <Container>
                        <br /><br /><br /><br /><br /><br />
                        <h3 className="mt-5 text-center">Nema podataka za prikaz <HiOutlineEmojiSad /></h3>
                    </Container>                   
                }
                {
                    conditions.length !== 0
                    &&
                    <Container>
                        <Row>                           
                            <Col style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
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
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    selectedCondition[0]
                                    &&
                                    <Container>
                                        {
                                            selectedAggregation[0]
                                            &&
                                            <h3 className="mt-5"><BsThermometerSun />Temperatura</h3>
                                        }
                                        {
                                            selectedAggregation[1]
                                            &&
                                            <h3 className="mt-5"><BsThermometerSun />Prosečna temperatura po satima</h3>
                                        }
                                        {
                                            selectedAggregation[2]
                                            &&
                                            <h3 className="mt-5"><BsThermometerSun />Minimalna temperatura po satima</h3>
                                        }
                                        {
                                            selectedAggregation[3]
                                            &&
                                            <h3 className="mt-5"><BsThermometerSun />Maksimalna temperatura po satima</h3>
                                        }
                                        {
                                            selectedAggregation[4]
                                            &&
                                            <h3 className="mt-5"><BsThermometerSun />Medijana temperature po satima</h3>
                                        }
                                        <Line data={dataLineTemperature} options={temperature_line_chart_options} />
                                    </Container>
                                }
                                {
                                    selectedCondition[1]
                                    &&
                                    <Container>
                                        {
                                            selectedAggregation[0]
                                            &&
                                            <h3 className="mt-5"><WiHumidity />Vlažnost vazduha</h3>
                                        }
                                        {
                                            selectedAggregation[1]
                                            &&
                                            <h3 className="mt-5"><WiHumidity />Prosečna vlažnost vazduha po satima</h3>
                                        }
                                        {
                                            selectedAggregation[2]
                                            &&
                                            <h3 className="mt-5"><WiHumidity />Minimalna vlažnost vazduha po satima</h3>
                                        }
                                        {
                                            selectedAggregation[3]
                                            &&
                                            <h3 className="mt-5"><WiHumidity />Maksimalna vlažnost vazduha po satima</h3>
                                        }
                                        {
                                            selectedAggregation[4]
                                            &&
                                            <h3 className="mt-5"><WiHumidity />Medijana vlažnosti vazduha po satima</h3>
                                        }
                                        <Bar data={dataBarHumidity} options={humidity_bar_chart_options} />
                                    </Container>
                                }
                                {
                                    selectedCondition[2]
                                    &&
                                    <Container>
                                        {
                                            selectedAggregation[0]
                                            &&
                                            <h3 className="mt-5"><FaWind />Brzina vetra</h3>
                                        }
                                        {
                                            selectedAggregation[1]
                                            &&
                                            <h3 className="mt-5"><FaWind />Prosečna brzina vetra po satima</h3>
                                        }
                                        {
                                            selectedAggregation[2]
                                            &&
                                            <h3 className="mt-5"><FaWind />Minimalna brzina vetra po satima</h3>
                                        }
                                        {
                                            selectedAggregation[3]
                                            &&
                                            <h3 className="mt-5"><FaWind />Maksimalna brzina vetra po satima</h3>
                                        }
                                        {
                                            selectedAggregation[4]
                                            &&
                                            <h3 className="mt-5"><FaWind />Medijana brzine vetra po satima</h3>
                                        }
                                        <Line data={dataLineWindSpeed} options={windspeed_line_chart_options} />
                                    </Container>
                                }
                                {
                                    selectedCondition[3]
                                    &&
                                    <Container>
                                        {
                                            selectedAggregation[0]
                                            &&
                                            <h3 className="mt-5"><GiSunRadiations />UV indeks</h3>
                                        }
                                        {
                                            selectedAggregation[1]
                                            &&
                                            <h3 className="mt-5"><GiSunRadiations />Prosečna vrednost UV indeksa po satima</h3>
                                        }
                                        {
                                            selectedAggregation[2]
                                            &&
                                            <h3 className="mt-5"><GiSunRadiations />Minimalna vrednost UV indeksa po satima</h3>
                                        }
                                        {
                                            selectedAggregation[3]
                                            &&
                                            <h3 className="mt-5"><GiSunRadiations />Maksimalna vrednost UV indeksa po satima</h3>
                                        }
                                        {
                                            selectedAggregation[4]
                                            &&
                                            <h3 className="mt-5"><GiSunRadiations />Medijana vrednosti UV indeksa po satima</h3>
                                        }
                                        <Bar data={dataBarUV} options={uvindex_bar_chart_options} />
                                    </Container>
                                }
                            </Col>
                        </Row>
                    </Container>
                }                                
            </Container>
            );
    }  
}