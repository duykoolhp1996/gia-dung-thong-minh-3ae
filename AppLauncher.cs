using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Threading;

namespace MarketingHub3AE
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            int port = 8888;
            string url = "http://localhost:8888/";

            // 1. Check if server is running on port 8888
            bool isServerRunning = false;
            try
            {
                using (var tcp = new TcpClient())
                {
                    var result = tcp.BeginConnect("127.0.0.1", port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(600);
                    if (success && tcp.Connected)
                    {
                        tcp.EndConnect(result);
                        isServerRunning = true;
                    }
                }
            }
            catch { }

            // 2. Start server in background if not running
            if (!isServerRunning)
            {
                string serverScript = Path.Combine(appDir, "server.ps1");
                if (File.Exists(serverScript))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = "powershell.exe";
                    psi.Arguments = string.Format("-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File \"{0}\"", serverScript);
                    psi.WindowStyle = ProcessWindowStyle.Hidden;
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    psi.WorkingDirectory = appDir;
                    Process.Start(psi);
                    Thread.Sleep(1800);
                }
            }

            // 3. Launch in standalone app mode via Edge or Chrome
            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edge))
            {
                edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            string chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            if (!File.Exists(chrome))
            {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
            }

            string browserExe = null;
            if (File.Exists(edge)) browserExe = edge;
            else if (File.Exists(chrome)) browserExe = chrome;

            if (browserExe != null)
            {
                ProcessStartInfo appPsi = new ProcessStartInfo();
                appPsi.FileName = browserExe;
                appPsi.Arguments = string.Format("--app=\"{0}\" --window-size=1440,900", url);
                appPsi.UseShellExecute = false;
                Process.Start(appPsi);
            }
            else
            {
                Process.Start(url);
            }
        }
    }
}
