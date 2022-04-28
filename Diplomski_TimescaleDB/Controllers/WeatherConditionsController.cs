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
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
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
                                    device_id = rdr.GetString(0),
                                    location = rdr.GetString(1),
                                    environment = rdr.GetString(2)
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
        [Route("GetConditions/{deviceid}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetConditions(string deviceid, string fromdate, string todate)
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
                         "' AND c.device_id = '" + deviceid + "' ORDER BY c.time ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    deviceid = rdr.GetString(1),
                                    temperature = rdr.GetDouble(2),
                                    humidity = rdr.GetDouble(3),
                                    windspeed = rdr.GetDouble(4),
                                    uvindex = rdr.GetDouble(5)
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
        [Route("GetHourlyAvgConditions/{deviceid}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyAvgConditions(string deviceid, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour"",c.device_id,round(avg(temperature)) avg_temp," +
                         "round(avg(humidity)) avg_hum,round(avg(wind_speed)) avg_wind,round(avg(uv_index)) avg_uvi " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_id = '" + deviceid + @"' GROUP BY ""hour"",c.device_id ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    deviceid = rdr.GetString(1),
                                    temperature = rdr.GetDouble(2),
                                    humidity = rdr.GetDouble(3),
                                    windspeed = rdr.GetDouble(4),
                                    uvindex = rdr.GetDouble(5)
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
        [Route("GetHourlyMinConditions/{deviceid}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyMinConditions(string deviceid, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour"",c.device_id,round(min(temperature)) min_temp," +
                         "round(min(humidity)) min_hum,round(min(wind_speed)) min_wind,round(min(uv_index)) min_uvi " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_id = '" + deviceid + @"' GROUP BY ""hour"",c.device_id ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    deviceid = rdr.GetString(1),
                                    temperature = rdr.GetDouble(2),
                                    humidity = rdr.GetDouble(3),
                                    windspeed = rdr.GetDouble(4),
                                    uvindex = rdr.GetDouble(5)
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
        [Route("GetHourlyMaxConditions/{deviceid}/{fromdate}/{todate}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetHourlyMaxConditions(string deviceid, string fromdate, string todate)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            try
            {
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    string sql = @"SELECT date_trunc('hour', time) ""hour"",c.device_id,round(max(temperature)) max_temp," +
                         "round(max(humidity)) max_hum,round(max(wind_speed)) max_wind,round(max(uv_index)) max_uvi " +
                         "FROM conditions c " +
                         "WHERE DATE(c.time) BETWEEN '" + fromdate + "' AND '" + todate +
                         "' AND c.device_id = '" + deviceid + @"' GROUP BY ""hour"",c.device_id ORDER BY ""hour"" ASC;";
                    using (var command = new NpgsqlCommand(sql, timescaleConnection))
                    {
                        using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                        {
                            while (rdr.Read())
                                response.Add(new WeatherConditions
                                {
                                    time = rdr.GetDateTime(0),
                                    deviceid = rdr.GetString(1),
                                    temperature = rdr.GetDouble(2),
                                    humidity = rdr.GetDouble(3),
                                    windspeed = rdr.GetDouble(4),
                                    uvindex = rdr.GetDouble(5)
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