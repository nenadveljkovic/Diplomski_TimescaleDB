using CsvHelper;
using Diplomski_TimescaleDB.Models;
using Newtonsoft.Json;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace Weather_pro_2
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
            List<WeatherConditions> conditions;
            string jsonString;
            using var fileReader = new StreamReader(@"podaci_conditions.csv");
            using (var csv = new CsvReader(fileReader, CultureInfo.InvariantCulture))
            {
                conditions = csv.GetRecords<WeatherConditions>().ToList();
            }
            jsonString = JsonConvert.SerializeObject(conditions);
            var body = Encoding.UTF8.GetBytes(jsonString);
            channel.BasicPublish("", "conditions", null, body);
        }
    }
}
