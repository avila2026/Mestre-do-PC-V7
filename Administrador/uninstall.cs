using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Security.Principal;
using System.Text;
using System.Threading;

class Uninstaller
{
    private const string TargetDir = @"C:\MestreDoPC_V7";
    private const string TaskName = "MestreDoPC_Admin_Launcher";

    static int Main()
    {
        if (IsAdministrator() == false)
        {
            return RelaunchAsAdministrator();
        }

        Console.Title = "Mestre do PC V7 - Desinstalador";
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("==================================================");
        Console.WriteLine("        MESTRE DO PC V7 - DESINSTALACAO");
        Console.WriteLine("==================================================");
        Console.ResetColor();
        Console.WriteLine();

        Console.Write("Deseja realmente desinstalar o Mestre do PC V7? (S/N): ");
        string confirm = (Console.ReadLine() ?? string.Empty).Trim().ToUpperInvariant();
        if (confirm != "S" && confirm != "SIM")
        {
            Console.WriteLine();
            Console.WriteLine("[INFO] Desinstalacao cancelada.");
            Console.Write("Pressione Enter para sair...");
            Console.ReadLine();
            return 0;
        }

        try
        {
            StopLauncher();
            UnregisterTask();
            DeleteShortcut();
            ScheduleDirectoryRemoval();

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine();
            Console.WriteLine("[OK] Desinstalacao agendada com sucesso.");
            Console.WriteLine("[OK] Pode fechar esta janela.");
            Console.ResetColor();
            Thread.Sleep(1000);
            return 0;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine();
            Console.WriteLine("[ERRO] " + ex.Message);
            Console.ResetColor();
            Console.Write("Pressione Enter para sair...");
            Console.ReadLine();
            return 1;
        }
    }

    private static bool IsAdministrator()
    {
        WindowsIdentity identity = WindowsIdentity.GetCurrent();
        WindowsPrincipal principal = new WindowsPrincipal(identity);
        return principal.IsInRole(WindowsBuiltInRole.Administrator);
    }

    private static int RelaunchAsAdministrator()
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = Process.GetCurrentProcess().MainModule.FileName,
                UseShellExecute = true,
                Verb = "runas",
            };

            Process.Start(psi);
            return 0;
        }
        catch (Win32Exception)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("[ERRO] Elevacao cancelada pelo usuario.");
            Console.ResetColor();
            return 1;
        }
    }

    private static void StopLauncher()
    {
        string pidFile = Path.Combine(TargetDir, "MestreDoPC-Launcher.pid");
        if (File.Exists(pidFile) == false)
        {
            return;
        }

        string rawPid = File.ReadAllText(pidFile).Trim();
        int pid;
        if (int.TryParse(rawPid, out pid) == false)
        {
            return;
        }

        try
        {
            Process process = Process.GetProcessById(pid);
            process.Kill();
            process.WaitForExit(5000);
        }
        catch
        {
        }

        try
        {
            File.Delete(pidFile);
        }
        catch
        {
        }
    }

    private static void UnregisterTask()
    {
        ProcessStartInfo psi = new ProcessStartInfo
        {
            FileName = "schtasks.exe",
            Arguments = string.Format("/Delete /TN \"{0}\" /F", TaskName),
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        using (Process process = Process.Start(psi))
        {
            process.WaitForExit();
        }
    }

    private static void DeleteShortcut()
    {
        string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
        string shortcut = Path.Combine(desktop, "Mestre do PC V7.lnk");
        if (File.Exists(shortcut))
        {
            File.Delete(shortcut);
        }
    }

    private static void ScheduleDirectoryRemoval()
    {
        if (Directory.Exists(TargetDir) == false)
        {
            return;
        }

        string scriptPath = Path.Combine(
            Path.GetTempPath(),
            "mestre-uninstall-" + Guid.NewGuid().ToString("N") + ".cmd"
        );

        string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
        string shortcut = Path.Combine(desktop, "Mestre do PC V7.lnk");

        StringBuilder builder = new StringBuilder();
        builder.AppendLine("@echo off");
        builder.AppendLine("timeout /t 2 /nobreak >nul");
        builder.AppendLine("rmdir /s /q \"" + TargetDir + "\"");
        builder.AppendLine("del /q \"" + shortcut + "\" >nul 2>nul");
        builder.AppendLine("del /q \"" + scriptPath + "\"");

        File.WriteAllText(scriptPath, builder.ToString(), Encoding.ASCII);

        ProcessStartInfo psi = new ProcessStartInfo
        {
            FileName = "cmd.exe",
            Arguments = "/c \"" + scriptPath + "\"",
            CreateNoWindow = true,
            UseShellExecute = false,
        };

        Process.Start(psi);
    }
}
