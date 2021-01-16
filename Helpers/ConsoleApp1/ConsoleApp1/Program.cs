﻿using System;
using System.Diagnostics;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            BuildAlerts();
        }

        private static void BuildAlerts()
        {
            var precipitation = "";
            var ice = "";
            var wind = "";
            for (int i = 0; i < 60; i++)
            {
                precipitation+= $"\t<arc id='p_{i}' x='4' y='4' width='100%-8' height='100%-8' fill='red' arc-width='2' start-angle='{1 + i * 360 / 60}' sweep-angle='5'/>\n";
                wind += $"\t<arc id='w_{i}' x='0' y='0' width='100%' height='100%' fill='blue' arc-width='2' start-angle='{0 + i * 360 / 60}' sweep-angle='6'/>\n";
                ice += $"\t<arc id='i_{i}' x='0' y='0' width='100%' height='100%' fill='cyan' arc-width='3' start-angle='{1 + i * 360 / 60}' sweep-angle='5'/>\n";
            }
            var svg = 
                $"<g id=\"wind_alerts\">\n{wind}</g>\n"+
                $"<g id=\"precipitation_alerts\">\n{precipitation}</g>\n" +
                $"<g id=\"ice_alerts\">\n{ice}</g>\n";

            Console.WriteLine(svg);
            Debug.WriteLine(svg);

        }
        private static void BuildAlertsWithAnimation()
        {
            for (int i = 0; i < 60; i++)
            {
                var text = $"<arc id='p_{i}' x='4' y='4' width='100%-8' height='100%-8' fill='red' arc-width='2' start-angle='{1 + i * 360 / 60}' sweep-angle='5'>\n" +
                    $"\t<animate id='pa_{i}' begin='enable' attributeName='fill' from='black' to='red' dur='1'/>\n" +
                    "</arc>\n" +
                    $"<arc id='i_{i}' x='0' y='0' width='100%' height='100%' fill='cyan' arc-width='3' start-angle='{1 + i * 360 / 60}' sweep-angle='5'>\n" +
                    $"\t<animate id='ia_{i}' begin='enable' attributeName='fill' from='black' to='cyan' dur='1'/>\n" +
                    "</arc>\n";
                Console.WriteLine(text);
                Debug.WriteLine(text);
            }
        }

    }
}
