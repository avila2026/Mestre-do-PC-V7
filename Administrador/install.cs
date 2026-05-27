using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Runtime.InteropServices;

class Installer
{
    private const string TargetDir = @"C:\MestreDoPC_V7";
    private const string TaskName = "MestreDoPC_Admin_Launcher";
    private static readonly string Secret = "MpC$V7!2026@Key#";
    private static readonly byte[] IV = Encoding.UTF8.GetBytes("1234567890123456");

    static int Main()
    {
        if (IsAdministrator() == false)
        {
            return RelaunchAsAdministrator();
        }

        Console.Title = "Mestre do PC V7 - Instalador";
        ShowBanner();

        try
        {
            string clientName = EnsureAuthorized();
            InstallRuntime(clientName);

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine();
            Console.WriteLine("[OK] Instalacao concluida com sucesso.");
            Console.WriteLine("[OK] Task automatica registrada: " + TaskName);
            Console.WriteLine("[OK] Atalho criado na Area de Trabalho.");
            Console.ResetColor();
            return 0;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine();
            Console.WriteLine("[ERRO] " + ex.Message);
            Console.ResetColor();
            return 1;
        }
        finally
        {
            Console.WriteLine();
            Console.Write("Pressione Enter para sair...");
            Console.ReadLine();
        }
    }

    private static void ShowBanner()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("==================================================");
        Console.WriteLine("         MESTRE DO PC V7 - INSTALACAO");
        Console.WriteLine("==================================================");
        Console.ResetColor();
        Console.WriteLine();
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
            string currentDir = Path.GetDirectoryName(Process.GetCurrentProcess().MainModule.FileName);
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = Process.GetCurrentProcess().MainModule.FileName,
                WorkingDirectory = currentDir,
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

    private static string EnsureAuthorized()
    {
        string licPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "mestre.lic");
        string clientName = "Desconhecido";

        if (File.Exists(licPath))
        {
            try
            {
                string decrypted = Decrypt(File.ReadAllText(licPath).Trim());
                string keyToCheck = decrypted;

                if (decrypted.Contains("|||"))
                {
                    string[] parts = decrypted.Split(new[] { "|||" }, StringSplitOptions.None);
                    if (parts.Length >= 2)
                    {
                        clientName = parts[0];
                        keyToCheck = parts[1];
                    }
                }

                if (IsValidKey(keyToCheck))
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("[OK] Licenca detectada para: " + clientName);
                    Console.ResetColor();
                    return clientName;
                }
            }
            catch
            {
            }
        }

        Console.Write("Digite o serial de instalacao: ");
        Console.ForegroundColor = ConsoleColor.Yellow;
        string typedKey = Console.ReadLine();
        Console.ResetColor();

        if (IsValidKey(typedKey) == false)
        {
            throw new InvalidOperationException("Serial invalido. A instalacao foi cancelada.");
        }

        return clientName;
    }

    private static bool IsValidKey(string key)
    {
        return string.Equals(key, "1597", StringComparison.OrdinalIgnoreCase)
            || string.Equals(key, "ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    private static void InstallRuntime(string clientName)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string dataDir = Path.Combine(baseDir, "Mestre_Dados");
        string mcpDir = ResolveMcpSource(baseDir, dataDir);
        string syncScript = Path.Combine(baseDir, "sync-mestre.ps1");

        if (Directory.Exists(dataDir) == false)
        {
            throw new DirectoryNotFoundException("Pasta Mestre_Dados nao encontrada ao lado do instalador.");
        }

        if (Directory.Exists(mcpDir) == false)
        {
            throw new DirectoryNotFoundException("Pasta mcp-server nao encontrada no pacote de instalacao.");
        }

        Directory.CreateDirectory(TargetDir);

        Dictionary<string, string> files = new Dictionary<string, string>
        {
            { Path.Combine(dataDir, "MestreDoPC-Ultimate-v7.html"), Path.Combine(TargetDir, "MestreDoPC-Ultimate-v7.html") },
            { Path.Combine(dataDir, "MestreDoPC-Launcher.ps1"), Path.Combine(TargetDir, "MestreDoPC-Launcher.ps1") },
            { Path.Combine(dataDir, "Register-MestreTask.ps1"), Path.Combine(TargetDir, "Register-MestreTask.ps1") },
            { Path.Combine(dataDir, "Abrir-MestreDoPC.exe"), Path.Combine(TargetDir, "Abrir-MestreDoPC.exe") },
            { Path.Combine(dataDir, "favicon.png"), Path.Combine(TargetDir, "favicon.png") },
            { Path.Combine(dataDir, "logo-mestre-v7-transparent.png"), Path.Combine(TargetDir, "logo-mestre-v7-transparent.png") },
            { Path.Combine(dataDir, "uninstall.exe"), Path.Combine(TargetDir, "uninstall.exe") },
            { Path.Combine(dataDir, "start-mestre.bat"), Path.Combine(TargetDir, "start-mestre.bat") },
            { Path.Combine(dataDir, "icon.ico"), Path.Combine(TargetDir, "icon.ico") },
        };

        if (File.Exists(syncScript))
        {
            files.Add(syncScript, Path.Combine(TargetDir, "sync-mestre.ps1"));
        }

        foreach (KeyValuePair<string, string> item in files)
        {
            CopyFileOrThrow(item.Key, item.Value);
        }

        PersonalizeHtml(Path.Combine(TargetDir, "MestreDoPC-Ultimate-v7.html"), clientName);
        CopyDirectory(mcpDir, Path.Combine(TargetDir, "mcp-server"));
        RegisterTask();
        CreateDesktopShortcut();
    }

    private static string ResolveMcpSource(string baseDir, string dataDir)
    {
        string siblingDir = Path.Combine(baseDir, "mcp-server");
        if (Directory.Exists(siblingDir))
        {
            return siblingDir;
        }

        return Path.Combine(dataDir, "mcp-server");
    }

    private static void CopyFileOrThrow(string source, string destination)
    {
        if (File.Exists(source) == false)
        {
            throw new FileNotFoundException("Arquivo obrigatorio ausente no pacote.", source);
        }

        Directory.CreateDirectory(Path.GetDirectoryName(destination));
        File.Copy(source, destination, true);
        Console.WriteLine("  -> Copiado: " + Path.GetFileName(destination));
    }

    private static void CopyDirectory(string sourceDir, string destinationDir)
    {
        Directory.CreateDirectory(destinationDir);

        foreach (string directory in Directory.GetDirectories(sourceDir, "*", SearchOption.AllDirectories))
        {
            string relative = directory.Substring(sourceDir.Length).TrimStart(Path.DirectorySeparatorChar);
            Directory.CreateDirectory(Path.Combine(destinationDir, relative));
        }

        foreach (string file in Directory.GetFiles(sourceDir, "*", SearchOption.AllDirectories))
        {
            string relative = file.Substring(sourceDir.Length).TrimStart(Path.DirectorySeparatorChar);
            string targetFile = Path.Combine(destinationDir, relative);
            Directory.CreateDirectory(Path.GetDirectoryName(targetFile));
            File.Copy(file, targetFile, true);
        }
    }

    private static void PersonalizeHtml(string htmlPath, string clientName)
    {
        string html = File.ReadAllText(htmlPath, Encoding.UTF8);
        html = html.Replace("{{CLIENT_NAME}}", clientName.ToUpperInvariant());
        html = html.Replace("{{PROJECT_PATH}}", TargetDir.Replace("\\", "\\\\"));
        File.WriteAllText(htmlPath, html, Encoding.UTF8);
    }

    private static void RegisterTask()
    {
        string registerScript = Path.Combine(TargetDir, "Register-MestreTask.ps1");
        RunHiddenProcess(
            Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Windows),
                @"System32\WindowsPowerShell\v1.0\powershell.exe"
            ),
            string.Format(
                "-NoProfile -ExecutionPolicy Bypass -File \"{0}\" -InstallDir \"{1}\" -Quiet",
                registerScript,
                TargetDir
            )
        );

        if (TaskExists() == false)
        {
            throw new InvalidOperationException("Falha ao registrar a task automatica do launcher.");
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

    private static void CreateDesktopShortcut()
    {
        string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
        string shortcutPath = Path.Combine(desktop, "Mestre do PC V7.lnk");
        string targetPath = Path.Combine(TargetDir, "Abrir-MestreDoPC.exe");
        string iconPath = Path.Combine(TargetDir, "icon.ico");

        Type shellType = Type.GetTypeFromProgID("WScript.Shell");
        if (shellType == null)
        {
            throw new InvalidOperationException("Nao foi possivel inicializar WScript.Shell para criar o atalho.");
        }

        object shell = null;
        object shortcut = null;

        try
        {
            shell = Activator.CreateInstance(shellType);
            shortcut = shellType.InvokeMember(
                "CreateShortcut",
                System.Reflection.BindingFlags.InvokeMethod,
                null,
                shell,
                new object[] { shortcutPath }
            );

            Type shortcutType = shortcut.GetType();
            shortcutType.InvokeMember("TargetPath", System.Reflection.BindingFlags.SetProperty, null, shortcut, new object[] { targetPath });
            shortcutType.InvokeMember("WorkingDirectory", System.Reflection.BindingFlags.SetProperty, null, shortcut, new object[] { TargetDir });
            shortcutType.InvokeMember("IconLocation", System.Reflection.BindingFlags.SetProperty, null, shortcut, new object[] { iconPath + ",0" });
            shortcutType.InvokeMember("Save", System.Reflection.BindingFlags.InvokeMethod, null, shortcut, null);
        }
        finally
        {
            if (shortcut != null && Marshal.IsComObject(shortcut))
            {
                Marshal.FinalReleaseComObject(shortcut);
            }

            if (shell != null && Marshal.IsComObject(shell))
            {
                Marshal.FinalReleaseComObject(shell);
            }
        }

        if (File.Exists(shortcutPath) == false)
        {
            throw new InvalidOperationException("Falha ao criar o atalho na Area de Trabalho: " + shortcutPath);
        }
    }

    private static void RunHiddenProcess(string fileName, string arguments)
    {
        ProcessStartInfo psi = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        using (Process process = Process.Start(psi))
        {
            process.WaitForExit();

            if (process.ExitCode == 0)
            {
                return;
            }

            string error = process.StandardError.ReadToEnd();
            if (string.IsNullOrWhiteSpace(error))
            {
                error = process.StandardOutput.ReadToEnd();
            }

            throw new InvalidOperationException(
                "Falha ao executar processo auxiliar. " + error.Trim()
            );
        }
    }

    private static string Decrypt(string cipherText)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Key = Encoding.UTF8.GetBytes(Secret);
            aes.IV = IV;

            ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using (MemoryStream ms = new MemoryStream(Convert.FromBase64String(cipherText)))
            using (CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
            using (StreamReader sr = new StreamReader(cs))
            {
                return sr.ReadToEnd();
            }
        }
    }
}
