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
            using var fileReader = new StreamReader(@"weather-pro-1_data.csv");
            using (var csv = new CsvReader(fileReader, CultureInfo.InvariantCulture))
            {
                conditions = csv.GetRecords<WeatherConditions>().ToList();
            }
            jsonString = JsonConvert.SerializeObject(conditions);
            var body = Encoding.UTF8.GetBytes(jsonString);
            channel.BasicPublish("", "conditions", null, body);
            /*List<WeatherConditions> conditions;
            List<WeatherConditions> extendedConditions = new List<WeatherConditions>();
            using var fileReader = new StreamReader(@"Pirot Nikole Pasica.csv");
            using (var csv = new CsvReader(fileReader, CultureInfo.InvariantCulture))
            {
                conditions = csv.GetRecords<WeatherConditions>().ToList();
            }
            Random random = new Random();
            foreach(WeatherConditions vc in conditions)
            {
                extendedConditions.Add(vc);
                for(int i=1;i<=11;i++)
                {
                    Double h = Math.Round(vc.humidity + (random.NextDouble() * 2 - 1), 2);
                    Double w = Math.Round(vc.windspeed + (random.NextDouble() * 2 - 1), 1);
                    Double u = Math.Round(vc.uvindex + (random.NextDouble() - 0.5));
                    extendedConditions.Add(new WeatherConditions 
                    {
                        time = vc.time.AddMinutes(i*5.0),
                        temperature = Math.Round(vc.temperature + (random.NextDouble() * 2 - 1),1),
                        humidity = h < 0 || h == -0 ? 0 : h,
                        windspeed = w < 0 || w == -0 ? 0 : w,
                        uvindex = u < 0 || u == -0 ? 0 : u,
                        deviceid = vc.deviceid
                    });
                }
            }
            using var fileWriter = new StreamWriter(@"C:\Users\User\Desktop\weatherdata_last30days_extended.csv");
            using (var csv = new CsvWriter(fileWriter, CultureInfo.InvariantCulture))
            {
                csv.WriteRecords(extendedConditions);
            }*/
        }
    }
}

