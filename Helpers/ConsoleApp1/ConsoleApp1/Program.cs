using System;
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
            for (int i = 0; i < 60; i++)
            {
                var text = $"<arc id='p_{i}' x='4' y='4' width='100%-8' height='100%-8' fill='red' arc-width='2' start-angle='{1 + i * 360 / 60}' sweep-angle='5'/>\n" +
                    $"<arc id='i_{i}' x='0' y='0' width='100%' height='100%' fill='cyan' arc-width='3' start-angle='{1 + i * 360 / 60}' sweep-angle='5'/>";
                Console.WriteLine(text);
            }
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
