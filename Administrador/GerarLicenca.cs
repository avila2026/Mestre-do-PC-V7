using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

class GerarLicenca
{
    private static readonly string Secret = "MpC$V7!2026@Key#"; // 16 bytes
    private static readonly byte[] IV = Encoding.UTF8.GetBytes("1234567890123456");

    static void Main()
    {
        Console.Title = "Gerador de Licenca - Mestre do PC V7";
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("==================================================");
        Console.WriteLine("       GERADOR DE LICENCA - MESTRE DO PC V7");
        Console.WriteLine("==================================================\n");
        Console.ResetColor();

        Console.Write("Digite o nome do cliente para esta licenca: ");
        Console.ForegroundColor = ConsoleColor.Cyan;
        string clientName = Console.ReadLine();
        Console.ResetColor();

        if (string.IsNullOrWhiteSpace(clientName)) {
            clientName = "Cliente Premium";
        }

        Console.Write("Digite a senha para criptografar (Pressione Enter para usar o padrao '1597'): ");
        Console.ForegroundColor = ConsoleColor.Yellow;
        string key = Console.ReadLine();
        Console.ResetColor();
        
        if (string.IsNullOrWhiteSpace(key)) {
            key = "1597";
        }
        
        try {
            string fullData = clientName + "|||" + key;
            string encrypted = Encrypt(fullData);
            File.WriteAllText("mestre.lic", encrypted);
            
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n[+] Sucesso! Arquivo 'mestre.lic' gerado na mesma pasta.");
            Console.WriteLine("[+] Envie para o cliente apenas:");
            Console.WriteLine("  1. O arquivo 'mestre.lic'");
            Console.WriteLine("  2. O arquivo 'install.exe'");
            Console.WriteLine("  3. A pasta 'Mestre_Dados'");
            Console.ResetColor();
        } catch (Exception ex) {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[X] Erro ao gerar: " + ex.Message);
            Console.ResetColor();
        }

        Console.WriteLine("\nPressione Enter para sair...");
        Console.ReadLine();
    }

    public static string Encrypt(string plainText)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Key = Encoding.UTF8.GetBytes(Secret);
            aes.IV = IV;

            ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

            using (MemoryStream ms = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                {
                    using (StreamWriter sw = new StreamWriter(cs))
                    {
                        sw.Write(plainText);
                    }
                    return Convert.ToBase64String(ms.ToArray());
                }
            }
        }
    }
}
