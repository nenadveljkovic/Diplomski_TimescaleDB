using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Diplomski_TimescaleDB.Models
{
    public class WeatherConditions
    {
        public DateTime time { get; set; }
        public Double temperature { get; set; }
        public Double humidity { get; set; }
        public Double windspeed { get; set; }
        public Double uvindex { get; set; }
        public String deviceid { get; set; }
    }
}
