# ================================================================
# Mestre do PC V7 - Servidor HTTP Admin (porta 7777)
# O HTML envia comandos via fetch() -> este PS executa como Admin
# ================================================================

# Forca execucao como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    # Tenta descobrir o caminho real do script
    $scriptPath = $PSCommandPath
    if (-not $scriptPath) { $scriptPath = $MyInvocation.MyCommand.Definition }
    if (-not $scriptPath -or -not (Test-Path $scriptPath)) { $scriptPath = "$PWD\MestreDoPC-Launcher.ps1" }
    
    if (Test-Path $scriptPath) {
        # Roda o próprio script como Admin
        Start-Process pwsh.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Normal -File `"$scriptPath`""
    }
    else {
        Write-Host "Falha ao elevar: Nao foi possivel determinar o caminho do script." -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
    exit
}

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Add-Type -AssemblyName System.Net.Http

$PORT = 7777
$URL = "http://127.0.0.1:$PORT/"

Clear-Host
Write-Host ""
Write-Host "  =================================================="  -ForegroundColor Cyan
Write-Host "   MESTRE DO PC V7  --  Servidor Admin Ativo"         -ForegroundColor Green
Write-Host "  =================================================="  -ForegroundColor Cyan
Write-Host ""
Write-Host "  STATUS : ADMINISTRADOR + SERVIDOR ATIVO"            -ForegroundColor Green
Write-Host "  URL    : http://localhost:$PORT"                     -ForegroundColor Cyan
Write-Host ""
Write-Host "  >> Abra o HTML no navegador e clique em [Executar]" -ForegroundColor Yellow
Write-Host "  >> Os comandos serao executados automaticamente aqui"-ForegroundColor Yellow
Write-Host ""
Write-Host "  Pressione Ctrl+C para encerrar o servidor"          -ForegroundColor Gray
Write-Host "  =================================================="  -ForegroundColor Cyan
Write-Host ""

# Cria listener HTTP
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($URL)

try {
    $listener.Start()
    Write-Host "  [OK] Aguardando comandos do HTML..." -ForegroundColor Green
    Write-Host ""

    while ($listener.IsListening) {
        # Aguarda requisicao (bloqueante)
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        # CORS -- permite o HTML local chamar a API
        $res.Headers.Add("Access-Control-Allow-Origin", "*")
        $res.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
        $res.ContentType = "application/json; charset=utf-8"

        # Preflight OPTIONS
        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        # GET /ping — checar se o servidor esta rodando
        if ($req.HttpMethod -eq "GET" -and $req.Url.AbsolutePath -eq "/ping") {
            $body = '{"status":"ok","admin":true}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            continue
        }

        # GET /mcp-status — checar se o Node.js MCP Server esta rodando via WMI
        if ($req.HttpMethod -eq "GET" -and $req.Url.AbsolutePath -eq "/mcp-status") {
            $mcpActive = Get-WmiObject Win32_Process -Filter "name='node.exe'" | Where-Object { $_.CommandLine -match "index\.js" }
            $status = if ($mcpActive) { "online" } else { "offline" }
            $body = '{"status":"'+$status+'"}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            continue
        }

        # GET /ollama-status — checar se o Ollama esta rodando e listar modelos
        if ($req.HttpMethod -eq "GET" -and $req.Url.AbsolutePath -eq "/ollama-status") {
            try {
                $ollamaRes = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
                $ollamaData = $ollamaRes.Content | ConvertFrom-Json
                $models = ($ollamaData.models | ForEach-Object { $_.name }) -join ","
                $body = "{`"status`":`"online`",`"models`":`"$models`"}"
            } catch {
                $body = '{"status":"offline","models":""}'
            }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            continue
        }

        # POST /run — recebe e executa o comando
        if ($req.HttpMethod -eq "POST" -and $req.Url.AbsolutePath -eq "/run") {
            try {
                $reader = New-Object System.IO.StreamReader($req.InputStream)
                $rawBody = $reader.ReadToEnd()
                $reader.Close()

                # Parse JSON nativo do PowerShell
                $data = $rawBody | ConvertFrom-Json
                $cmd = $data.cmd

                if ([string]::IsNullOrWhiteSpace($cmd)) {
                    $json = @{ success = $false; output = "Comando vazio recebido." } | ConvertTo-Json -Compress
                }
                else {
                    Write-Host "  [CMD] " -NoNewline -ForegroundColor Yellow
                    Write-Host $cmd.Split("`n")[0] -ForegroundColor White
                    Write-Host ""

                    # Executa e captura output (incluindo Write-Host via stream *>&1)
                    $output = try {
                        Invoke-Expression $cmd *>&1 | Out-String
                    }
                    catch {
                        "ERRO: $_"
                    }

                    Write-Host $output -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "  [OK] Comando concluido." -ForegroundColor Green
                    Write-Host ""

                    # Gera JSON de resposta usando cmdlet nativo
                    $json = @{ success = $true; output = "$output" } | ConvertTo-Json -Compress
                }
            }
            catch {
                $json = @{ success = $false; output = "Erro interno: $_" } | ConvertTo-Json -Compress
            }

            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            continue
        }

        # Rota nao encontrada
        $res.StatusCode = 404
        $notFound = '{"success":false,"output":"Rota nao encontrada."}'
        $nb = [System.Text.Encoding]::UTF8.GetBytes($notFound)
        $res.ContentLength64 = $nb.Length
        $res.OutputStream.Write($nb, 0, $nb.Length)
        $res.Close()
    }
}
catch [System.Net.HttpListenerException] {
    if ($_.Exception.ErrorCode -ne 995) {
        Write-Host "  [ERRO] $($_.Exception.Message)" -ForegroundColor Red
    }
}
finally {
    if ($listener.IsListening) { $listener.Stop() }
    Write-Host ""
    Write-Host "  Servidor encerrado. Ate logo!" -ForegroundColor Cyan
}