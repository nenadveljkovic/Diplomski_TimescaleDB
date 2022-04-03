using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using CsvHelper;
using System.Globalization;
using System.Text;
using Diplomski_TimescaleDB.Models;

namespace Weather_pro_1
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

