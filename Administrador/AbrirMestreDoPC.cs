using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

static class AbrirMestreDoPC
{
    private const string TaskName = "MestreDoPC_Admin_Launcher";
    private const string PingUrl = "http://127.0.0.1:7777/ping";

    [STAThread]
    static void Main()
    {
        try
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string htmlPath = Path.Combine(baseDir, "MestreDoPC-Ultimate-v7.html");
            string registerScript = Path.Combine(baseDir, "Register-MestreTask.ps1");

            if (File.Exists(htmlPath) == false)
            {
                throw new FileNotFoundException("Arquivo principal nao encontrado.", htmlPath);
            }

            EnsureTask(registerScript, baseDir);

            if (IsLauncherHealthy() == false)
            {
                RunScheduledTask();
                WaitForHealthyLauncher();
            }

            Process.Start(new ProcessStartInfo
            {
                FileName = htmlPath,
                UseShellExecute = true,
                WorkingDirectory = baseDir,
            });
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                ex.Message,
                "Mestre do PC V7",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private static void EnsureTask(string registerScript, string installDir)
    {
        if (TaskExists())
        {
            return;
        }

        if (File.Exists(registerScript) == false)
        {
            throw new FileNotFoundException(
                "Nao foi possivel localizar o script de registro da task.",
                registerScript
            );
        }

        RunElevatedPowerShell(string.Format(
            "-NoProfile -ExecutionPolicy Bypass -File \"{0}\" -InstallDir \"{1}\" -Quiet",
            registerScript,
            installDir
        ));

        if (TaskExists() == false)
        {
            throw new InvalidOperationException(
                "A task MestreDoPC_Admin_Launcher nao foi criada corretamente."
            );
        }
    }

    private static void RunScheduledTask()
    {
        ProcessStartInfo psi = new ProcessStartInfo
        {
            FileName = "schtasks.exe",
            Arguments = string.Format("/Run /TN \"{0}\"", TaskName),
            CreateNoWindow = true,
            UseShellExecute = false,
        };

        using (Process process = Process.Start(psi))
        {
            process.WaitForExit();
        }
    }

    private static void WaitForHealthyLauncher()
    {
        DateTime deadline = DateTime.UtcNow.AddSeconds(20);
        while (DateTime.UtcNow < deadline)
        {
            if (IsLauncherHealthy())
            {
                return;
            }

            Thread.Sleep(1000);
        }

        throw new TimeoutException(
            "O launcher admin nao respondeu ao health check em ate 20 segundos."
        );
    }

    private static bool IsLauncherHealthy()
    {
        try
        {
            using (WebClient client = new WebClient())
            {
                client.Encoding = System.Text.Encoding.UTF8;
                string response = client.DownloadString(PingUrl);
                return response.Contains("\"status\":\"ok\"");
            }
        }
        catch
        {
            return false;
        }
    }

    private static bool TaskExists()
    {
        ProcessStartInfo psi = new ProcessStartInfo
        {
            FileName = "schtasks.exe",
            Arguments = string.Format("/Query /TN \"{0}\"", TaskName),
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        using (Process process = Process.Start(psi))
        {
            process.WaitForExit();
            return process.ExitCode == 0;
        }
    }

    private static void RunElevatedPowerShell(string arguments)
    {
        ProcessStartInfo psi = new ProcessStartInfo
        {
            FileName = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Windows),
                @"System32\WindowsPowerShell\v1.0\powershell.exe"
            ),
            Arguments = arguments,
            UseShellExecute = true,
            Verb = "runas",
            WindowStyle = ProcessWindowStyle.Hidden,
        };

        using (Process process = Process.Start(psi))
        {
            process.WaitForExit();
            if (process.ExitCode == 0)
            {
                return;
            }
        }

        throw new InvalidOperationException(
            "Falha ao registrar a task de elevacao automatica."
        );
    }
}
