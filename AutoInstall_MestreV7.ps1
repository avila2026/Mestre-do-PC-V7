# =============================================================================
# 🚀 AUTO-INSTALLER MESTRE DO PC V7
# Automatiza: Instalação, MCP Server, Ollama Model e Claude Desktop Config
# =============================================================================

$ErrorActionPreference = "Stop"

# --- CONFIGURAÇÕES de CAMINHOS ---
$ProjectRoot = "C:\Users\Jeanc\OneDrive\Área de Trabalho\Mestre do PC V7\Mestre do PC V7"
$InstallDir = "C:\MestreDoPC_V7"
$McpDir = Join-Path $InstallDir "mcp-server"
$ClaudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   AUTOMAÇÃO COMPLETA MESTRE DO PC V7" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Cyan

# 0. BUILD E ATALHOS (Pre-requisitos de Interface)
Write-Host "[0/6] Gerando binários e atalhos..." -ForegroundColor Yellow
try {
    $csc = "C:\WINDOWS\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    $sourceExe = Join-Path $ProjectRoot "Administrador\AbrirMestreDoPC.cs"
    $targetExe = Join-Path $InstallDir "Abrir-MestreDoPC.exe"
    $iconFile = Join-Path $ProjectRoot "Sistema\Mestre_Dados\icon.ico"
    $targetIcon = Join-Path $InstallDir "icon.ico"
    
    # Compilação direta para a pasta de instalação
    if (Test-Path $sourceExe) {
        Write-Host "  -> Compilando Abrir-MestreDoPC.exe..." -ForegroundColor Gray
        & $csc /nologo /optimize+ /target:winexe /out:$targetExe /win32icon:$targetIcon /reference:System.Windows.Forms.dll $sourceExe
        Write-Host "  [OK] Executável gerado." -ForegroundColor Green
    }

    # Garantir que o ícone esteja no local correto
    if (Test-Path $iconFile) {
        Copy-Item $iconFile -Destination $targetIcon -Force
    }

    # Criar atalho na área de trabalho
    $shortcutScript = Join-Path $ProjectRoot "Sistema\Create-MestreShortcut.ps1"
    if (Test-Path $shortcutScript) {
        Write-Host "  -> Criando atalho na área de trabalho..." -ForegroundColor Gray
        & $shortcutScript -InstallDir $InstallDir
        Write-Host "  [OK] Atalho criado." -ForegroundColor Green
    }
} catch {
    Write-Host "  [AVISO] Falha na criação de atalhos: $($_.Exception.Message)" -ForegroundColor Magenta
}

# 1. INSTALAÇÃO BASE
Write-Host "`n[1/6] Executando instalador base..." -ForegroundColor Yellow
$installer = Join-Path $ProjectRoot "Sistema\install.exe"
if (Test-Path $installer) {
    Start-Process $installer -Wait
    Write-Host "  [OK] Arquivos copiados para $InstallDir" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Instalador não encontrado em $installer" -ForegroundColor Red
    exit 1
}

# 2. CONFIGURAÇÃO MCP SERVER
Write-Host "`n[2/6] Configurando Servidor MCP..." -ForegroundColor Yellow
if (Test-Path $McpDir) {
    Set-Location $McpDir
    
    Write-Host "  -> Instalando dependências Node.js..." -ForegroundColor Gray
    & npm install
    
    if (Test-Path ".env.example" -and -not (Test-Path ".env")) {
        Write-Host "  -> Criando arquivo .env..." -ForegroundColor Gray
        Copy-Item ".env.example" ".env"
    }
    Write-Host "  [OK] MCP Server pronto." -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Pasta MCP não encontrada em $McpDir" -ForegroundColor Red
}

# 3. CONFIGURAÇÃO CLAUDE DESKTOP
Write-Host "`n[3/6] Atualizando configuração do Claude Desktop..." -ForegroundColor Yellow
if (Test-Path $ClaudeConfigPath) {
    $content = Get-Content $ClaudeConfigPath -Raw | ConvertFrom-Json
    
    # Atualiza a entrada mestre_do_pc
    if ($content.mcpServers.mestre_do_pc) {
        $content.mcpServers.mestre_do_pc.command = "node"
        $content.mcpServers.mestre_do_pc.args = @("$McpDir\index.js")
        $content.mcpServers.mestre_do_pc.env = @{
            "MESTRE_PROJETO_PATH" = $ProjectRoot
        }
        
        $json = $content | ConvertTo-Json -Depth 10
        Set-Content -Path $ClaudeConfigPath -Value $json -Encoding UTF8
        Write-Host "  [OK] Configuração do Claude atualizada." -ForegroundColor Green
    } else {
        Write-Host "  [AVISO] Servidor mestre_do_pc não encontrado no config do Claude. Verifique manualmente." -ForegroundColor Magenta
    }
} else {
    Write-Host "  [ERRO] Arquivo de configuração do Claude não encontrado." -ForegroundColor Red
}

# 4. ATIVAÇÃO DA IA (OLLAMA)
Write-Host "`n[4/6] Verificando e baixando modelo de IA..." -ForegroundColor Yellow
try {
    $ollamaCheck = Get-Command ollama -ErrorAction SilentlyContinue
    if ($ollamaCheck) {
        Write-Host "  -> Baixando qwen2.5:1.5b (isso pode demorar)..." -ForegroundColor Gray
        & ollama pull qwen2.5:1.5b
        Write-Host "  [OK] Modelo de IA baixado e ativo." -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] Ollama não instalado. Baixe em ollama.com" -ForegroundColor Red
    }
} catch {
    Write-Host "  [ERRO] Falha ao interagir com Ollama: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. ATIVAÇÃO DO LAUNCHER E CHAT
Write-Host "`n[5/6] Ativando Launcher e Interface..." -ForegroundColor Yellow
$startBat = Join-Path $InstallDir "start-mestre.bat"
if (Test-Path $startBat) {
    Write-Host "  -> Iniciando servidor admin via Bootstrap..." -ForegroundColor Gray
    Start-Process $startBat
    Write-Host "  [OK] Launcher disparado." -ForegroundColor Green
} else {
    Write-Host "  [AVISO] start-mestre.bat não encontrado em $InstallDir" -ForegroundColor Magenta
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   🎉 TUDO PRONTO! SISTEMA OPERACIONAL." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nInstruções finais:"
Write-Host "1. Abra o Dashboard: $InstallDir\MestreDoPC-Ultimate-v7.html"
Write-Host "2. Reinicie o Claude Desktop para ativar o MCP."
Write-Host "3. Use o chat no dashboard para otimizar seu PC."
Write-Host "`nPressione qualquer tecla para sair..."
$null = [Console]::ReadKey()
