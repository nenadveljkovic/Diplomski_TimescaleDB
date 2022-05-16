using Diplomski_TimescaleDB.Models;
using Newtonsoft.Json;
using Npgsql;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataReceiver
{
    class Program
    {
        static void Main(string[] args)
        {
            var factory = new ConnectionFactory
            {
                Uri = new Uri("amqp://guest:guest@localhost:5672")
            };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.QueueDeclare("conditions",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);
            channel.QueueDeclare("devices",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);
            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (sender, e) => {
                var body = e.Body.ToArray();
                string message = Encoding.UTF8.GetString(body);
                
                var timescaleConnection = new NpgsqlConnection("Server=localhost;Username=postgres;Database=meteo;Port=5432;Password=admin");
                timescaleConnection.Open();
                using (timescaleConnection)
                {
                    if (e.RoutingKey == "conditions")
                    {
                        List<WeatherConditions> weatherConditions = JsonConvert.DeserializeObject<List<WeatherConditions>>(message);
                        string sql = @"INSERT INTO conditions VALUES ";
                        foreach (WeatherConditions c in weatherConditions)
                            sql += String.Format("('{0}', {1}, {2}, {3}, {4}, '{5}'),", c.time.ToString("yyyy-MM-dd HH:mm:ss"), 
                                c.temperature, c.humidity, c.windspeed, c.uvindex, c.deviceid);
                        sql = sql.Remove(sql.Length - 1, 1);
                        sql += " ON CONFLICT DO NOTHING;";
                        using (var command = new NpgsqlCommand(sql, timescaleConnection))
                        {
                            int nRows = command.ExecuteNonQuery();
                            Console.WriteLine(String.Format("Number of rows inserted={0}", nRows));
                        }
                    }
                    else if (e.RoutingKey == "devices")
                    {
                        Device device = JsonConvert.DeserializeObject<Device>(message);
                        string sql = @"INSERT INTO devices VALUES " +
                        String.Format("('{0}', '{1}', '{2}', {3}, {4})", device.device_id, device.location,
                                device.environment, device.latitude, device.longitude);
                        using (var command = new NpgsqlCommand(sql, timescaleConnection))
                        {
                            int nRows = command.ExecuteNonQuery();
                            Console.WriteLine(String.Format("Number of rows inserted={0}", nRows));
                        }
                    }                  
                }
            };
            channel.BasicConsume("conditions", true, consumer);
            channel.BasicConsume("devices", true, consumer);
            Console.ReadLine();
        }
    }
}
