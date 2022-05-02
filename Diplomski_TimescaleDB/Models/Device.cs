using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Diplomski_TimescaleDB.Models
{
    public class Device
    {
        public string device_id { get; set; }
        public string location { get; set; }
        public string environment { get; set; }
        public double latitude { get; set; }
        public double longitude { get; set; }
    }
}
