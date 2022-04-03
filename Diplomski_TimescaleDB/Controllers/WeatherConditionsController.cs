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
            return Ok(response);
        }

        [HttpGet]
        [Route("GetDates/{deviceid}")]
        public async Task<ActionResult<List<string>>> GetDates(string deviceid)
        {
            List<string> response = new List<string>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            timescaleConnection.Open();
            using (timescaleConnection)
            {
                string sql = @"SELECT DISTINCT TO_CHAR(DATE(time),'dd.mm.yyyy') ""date"" FROM conditions " +
                    "WHERE device_id = '" + deviceid + @"' ORDER BY ""date"" ASC LIMIT 3;";
                using (var command = new NpgsqlCommand(sql, timescaleConnection))
                {
                    using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                    {
                        while (rdr.Read())
                            response.Add(rdr.GetString(0));
                    }
                }
            }
            return Ok(response);
        }

        [HttpGet]
        [Route("GetConditions/{deviceid}/{date}")]
        public async Task<ActionResult<List<WeatherConditions>>> GetConditions(string deviceid, string date)
        {
            List<WeatherConditions> response = new List<WeatherConditions>();
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            timescaleConnection.Open();
            using (timescaleConnection)
            {
                string sql = @"SELECT date_trunc('hour', time) ""hour"",c.device_id,round(avg(temperature)) avg_temp," +
                     "round(avg(humidity)) avg_hum,round(avg(wind_speed)) avg_wind,round(avg(uv_index)) avg_uvi " +
                     "FROM conditions c " +
                     "WHERE TO_CHAR(DATE(c.time),'dd.mm.yyyy') = '" + date + 
                     "' AND c.device_id = '" + deviceid + @"' GROUP BY ""hour"",c.device_id ORDER BY ""hour"" ASC;";
                using (var command = new NpgsqlCommand(sql, timescaleConnection))
                {
                    using (NpgsqlDataReader rdr = await command.ExecuteReaderAsync())
                    {
                        while (rdr.Read())
                            response.Add(new WeatherConditions {
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
            return Ok(response);
        }
    }   
}