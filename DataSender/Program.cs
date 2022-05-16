using CsvHelper;
using Diplomski_TimescaleDB.Models;
using Newtonsoft.Json;
using Npgsql;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace DataSender
{
    class Program
    {
        public class ThreadWeatherStation
        {
            private string weatherStationName;
            public ThreadWeatherStation(string wsn)
            {
                weatherStationName = wsn;
            }
            public void ThreadBody()
            {
                var factory = new ConnectionFactory
                {
                    Uri = new Uri("amqp://guest:guest@localhost:5672")
                };
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();
                channel.QueueDeclare("devices", durable: true, exclusive: false, autoDelete: false, arguments: null);
                channel.QueueDeclare("conditions", durable: true, exclusive: false, autoDelete: false, arguments: null);
                Device device;
                string jsonStringDevice;
                using var fileReaderDevice = new StreamReader(weatherStationName + @".csv");
                using (var csvDevice = new CsvReader(fileReaderDevice, CultureInfo.InvariantCulture))
                {
                    csvDevice.Read();
                    device = csvDevice.GetRecord<Device>();
                }
                jsonStringDevice = JsonConvert.SerializeObject(device);
                var body = Encoding.UTF8.GetBytes(jsonStringDevice);
                channel.BasicPublish("", "devices", null, body);
                List<WeatherConditions> conditions;
                string jsonStringConditions;
                using var fileReaderConditions = new StreamReader(weatherStationName + @"_data.csv");
                using (var csvConditions = new CsvReader(fileReaderConditions, CultureInfo.InvariantCulture))
                {
                    conditions = csvConditions.GetRecords<WeatherConditions>().ToList();                    
                }
                jsonStringConditions = JsonConvert.SerializeObject(conditions);
                body = Encoding.UTF8.GetBytes(jsonStringConditions);
                channel.BasicPublish("", "conditions", null, body);
            }
        }

        static void Main(string[] args)
        {
            var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
            timescaleConnection.Open();
            using (timescaleConnection)
            {
                string sql = @"DELETE FROM conditions;";
                using (var command = new NpgsqlCommand(sql, timescaleConnection))
                {
                    command.ExecuteNonQuery();
                }
                sql = @"DELETE FROM devices;";
                using (var command = new NpgsqlCommand(sql, timescaleConnection))
                {
                    command.ExecuteNonQuery();
                }
            }
            Thread t;
            ThreadWeatherStation tws;
            int n = Int32.Parse(ConfigurationManager.AppSettings["NumberOfDevices"]);
            for (int i = 1; i <= n; i++)
            {
                tws = new ThreadWeatherStation("weather-pro-" + i.ToString());
                t = new Thread(new ThreadStart(tws.ThreadBody));
                t.Start();
            }
        }
    }
}
