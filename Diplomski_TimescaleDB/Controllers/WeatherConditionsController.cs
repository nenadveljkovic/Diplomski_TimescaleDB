using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Diplomski_TimescaleDB.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Diplomski_TimescaleDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherConditionsController : ControllerBase
    {
        [HttpGet]
        [Route("GetDevices")]
        public async Task<ActionResult<List<Device>>> GetDevices()
        {
            List<Device> response = new List<Device>();
            var timescaleConnection = 
                new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT * FROM devices;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new Device
                                {
                                    device_id = rdr.GetInt32(0),
                                    device_name = rdr.GetString(1),
                                    location = rdr.GetString(2),
                                    environment = rdr.GetString(3),
                                    latitude = rdr.GetDouble(4),
                                    longitude = rdr.GetDouble(5)
                                });
                        }
                    }
                }
            }
            catch(NpgsqlException e)
            {               
                if(e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.ConnectionException))
                {
                    Console.WriteLine("Greška prilikom otvaranja konekcije sa bazom" + e.Message);
                }
                else if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.SyntaxErrorOrAccessRuleViolation))
                {
                    Console.WriteLine("Greška prilikom izvršavanja upita prema bazi" + e.Message);
                }
                else
                    Console.WriteLine("Greška prilikom rada sa bazom" + e.Message);
            }          
            return Ok(response);
        }

        [HttpGet]
        [Route("GetConditions/{devicename}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetConditions(string devicename, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT * FROM conditions c " +
                        "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_name = '" + devicename + "' ORDER BY c.time ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),                                   
                                    temperature = rdr.GetDouble(1),
                                    humidity = rdr.GetDouble(2),
                                    windspeed = rdr.GetDouble(3),
                                    uvindex = rdr.GetDouble(4),
                                    devicename = rdr.GetString(5)
                                });
                        }
                    }
                }
            }
            catch (NpgsqlException e)
            {
                if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.ConnectionException))
                {
                    Console.WriteLine("Greška prilikom otvaranja konekcije sa bazom" + e.Message);
                }
                else if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.SyntaxErrorOrAccessRuleViolation))
                {
                    Console.WriteLine("Greška prilikom izvršavanja upita prema bazi" + e.Message);
                }
                else
                    Console.WriteLine("Greška prilikom rada sa bazom" + e.Message);
            }
            return Ok(response);
        }

        [HttpGet]
        [Route("GetHourlyAvgConditions/{devicename}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyAvgConditions(string devicename, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour"",round(avg(temperature)) avg_temp," +
                         "round(avg(humidity)) avg_hum,round(avg(wind_speed)) avg_wind,round(avg(uv_index)) avg_uvi,c.device_name " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_name = '" + devicename + @"' GROUP BY ""hour"",c.device_name ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    temperature = rdr.GetDouble(1),
                                    humidity = rdr.GetDouble(2),
                                    windspeed = rdr.GetDouble(3),
                                    uvindex = rdr.GetDouble(4),
                                    devicename = rdr.GetString(5)
                                });
                        }
                    }
                }
            }
            catch (NpgsqlException e)
            {
                if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.ConnectionException))
                {
                    Console.WriteLine("Greška prilikom otvaranja konekcije sa bazom" + e.Message);
                }
                else if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.SyntaxErrorOrAccessRuleViolation))
                {
                    Console.WriteLine("Greška prilikom izvršavanja upita prema bazi" + e.Message);
                }
                else
                    Console.WriteLine("Greška prilikom rada sa bazom" + e.Message);
            }
            return Ok(response);
        }

        [HttpGet]
        [Route("GetHourlyMinConditions/{devicename}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyMinConditions(string devicename, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour"",round(min(temperature)) min_temp," +
                         "round(min(humidity)) min_hum,round(min(wind_speed)) min_wind,round(min(uv_index)) min_uvi,c.device_name " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_name = '" + devicename + @"' GROUP BY ""hour"",c.device_name ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    temperature = rdr.GetDouble(1),
                                    humidity = rdr.GetDouble(2),
                                    windspeed = rdr.GetDouble(3),
                                    uvindex = rdr.GetDouble(4),
                                    devicename = rdr.GetString(5)
                                });
                        }
                    }
                }
            }
            catch (NpgsqlException e)
            {
                if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.ConnectionException))
                {
                    Console.WriteLine("Greška prilikom otvaranja konekcije sa bazom" + e.Message);
                }
                else if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.SyntaxErrorOrAccessRuleViolation))
                {
                    Console.WriteLine("Greška prilikom izvršavanja upita prema bazi" + e.Message);
                }
                else
                    Console.WriteLine("Greška prilikom rada sa bazom" + e.Message);
            }
            return Ok(response);
        }

        [HttpGet]
        [Route("GetHourlyMaxConditions/{devicename}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyMaxConditions(string devicename, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour"",round(max(temperature)) max_temp," +
                         "round(max(humidity)) max_hum,round(max(wind_speed)) max_wind,round(max(uv_index)) max_uvi,c.device_name " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_name = '" + devicename + @"' GROUP BY ""hour"",c.device_name ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    temperature = rdr.GetDouble(1),
                                    humidity = rdr.GetDouble(2),
                                    windspeed = rdr.GetDouble(3),
                                    uvindex = rdr.GetDouble(4),
                                    devicename = rdr.GetString(5)
                                });
                        }
                    }
                }
            }
            catch (NpgsqlException e)
            {
                if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.ConnectionException))
                {
                    Console.WriteLine("Greška prilikom otvaranja konekcije sa bazom" + e.Message);
                }
                else if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.SyntaxErrorOrAccessRuleViolation))
                {
                    Console.WriteLine("Greška prilikom izvršavanja upita prema bazi" + e.Message);
                }
                else
                    Console.WriteLine("Greška prilikom rada sa bazom" + e.Message);
            }
            return Ok(response);
        }

        [HttpGet]
        [Route("GetHourlyMedConditions/{devicename}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyMedConditions(string devicename, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour""," +
                         "PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY temperature) med_temp," +
                         "PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY humidity) med_hum," +
                         "PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY wind_speed) med_wind," +
                         "PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY uv_index) med_uvi,c.device_name " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_name = '" + devicename + @"' GROUP BY ""hour"",c.device_name ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    temperature = rdr.GetDouble(1),
                                    humidity = rdr.GetDouble(2),
                                    windspeed = rdr.GetDouble(3),
                                    uvindex = rdr.GetDouble(4),
                                    devicename = rdr.GetString(5)
                                });
                        }
                    }
                }
            }
            catch (NpgsqlException e)
            {
                if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.ConnectionException))
                {
                    Console.WriteLine("Greška prilikom otvaranja konekcije sa bazom" + e.Message);
                }
                else if (e.ErrorCode.Equals(Npgsql.PostgresErrorCodes.SyntaxErrorOrAccessRuleViolation))
                {
                    Console.WriteLine("Greška prilikom izvršavanja upita prema bazi" + e.Message);
                }
                else
                    Console.WriteLine("Greška prilikom rada sa bazom" + e.Message);
            }
            return Ok(response);
        }
    }   
}