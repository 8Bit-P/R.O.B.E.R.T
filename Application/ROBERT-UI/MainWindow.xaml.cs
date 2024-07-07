using System.Windows;
using System;
using System.IO.Ports;
using System.Windows.Media;

namespace ROBERT_UI
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            UpdateCBPorts();
        }

        private void UpdateCBPorts()
        {
            string[] availablePorts = SerialPort.GetPortNames();

            foreach (string port in availablePorts)
            {
                dropdownCOM.Items.Add(port);
            }

            // Set the default selected item to the first COM port, if available
            if (availablePorts.Length > 0)
            {
                dropdownCOM.SelectedIndex = 1;
            }
        }

        private void SendStringThroughSelectedPort(string data)
        {
            if (dropdownCOM.SelectedItem is string selectedPort && selectedPort != "Select")
            {
                try
                {
                    using (SerialPort serialPort = new SerialPort(selectedPort))
                    {
                        serialPort.Open();
                        serialPort.WriteLine(data);
                        MessageBox.Show($"Data sent to {selectedPort}");
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error: {ex.Message}");
                }
            }
            else
            {
                MessageBox.Show("Please select a valid COM port.");
            }
        }

        private string SendAndReceiveFromSelectedPort(string data)
        {
            if (dropdownCOM.SelectedItem is string selectedPort && selectedPort != "Select")
            {
                try
                {
                    using (SerialPort serialPort = new SerialPort(selectedPort))
                    {
                        serialPort.Open();
                        serialPort.WriteLine(data);

                        // Read response from the serial port
                        string response = serialPort.ReadLine();
                        return response;
                    }
                }
                catch (Exception ex)
                {
                    return $"Error: {ex.Message}";
                }
            }
            else
            {
                return "Please select a valid COM port.";
            }
        }

        private void checkPortConnection()
        {
            //Send command to check whether COM port is correct 
            string response = SendAndReceiveFromSelectedPort("CHECK>");
            MessageBox.Show(response);

            if (!String.IsNullOrEmpty(response))
            {
                StatusCircle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#24e072"));
            }
            else
            {
                StatusCircle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("Red"));
            }
        }

        private void dropdownCOM_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            UpdateCBPorts();
            checkPortConnection();
        }
    }
}