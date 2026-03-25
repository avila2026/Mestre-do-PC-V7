param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$systemDir = Join-Path $repoRoot "Sistema"
$dataDir = Join-Path $systemDir "Mestre_Dados"

$candidates = @(
    (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
    (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
)

$csc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $csc) {
    throw "csc.exe nao encontrado."
}

if ($Clean) {
    @(
        (Join-Path $systemDir "install.exe"),
        (Join-Path $dataDir "uninstall.exe"),
        (Join-Path $dataDir "Abrir-MestreDoPC.exe")
    ) | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item -LiteralPath $_ -Force
        }
    }
}

function Invoke-CSharpBuild {
    param(
        [string]$Source,
        [string]$Output,
        [string]$Target = "exe",
        [string[]]$References = @(),
        [string]$IconPath
    )

    $args = @(
        "/nologo",
        "/optimize+",
        "/target:$Target",
        "/out:$Output"
    )

    if ($IconPath -and (Test-Path $IconPath)) {
        $args += "/win32icon:$IconPath"
    }

    foreach ($reference in $References) {
        $args += "/reference:$reference"
    }

    $args += $Source

    & $csc @args
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao compilar $Source"
    }
}

Invoke-CSharpBuild `
    -Source (Join-Path $PSScriptRoot "install.cs") `
    -Output (Join-Path $systemDir "install.exe")

Invoke-CSharpBuild `
    -Source (Join-Path $PSScriptRoot "uninstall.cs") `
    -Output (Join-Path $dataDir "uninstall.exe")

Invoke-CSharpBuild `
    -Source (Join-Path $PSScriptRoot "AbrirMestreDoPC.cs") `
    -Output (Join-Path $dataDir "Abrir-MestreDoPC.exe") `
    -Target "winexe" `
    -References @("System.Windows.Forms.dll") `
    -IconPath (Join-Path $dataDir "icon.ico")

Write-Host ""
Write-Host "[OK] Build concluido." -ForegroundColor Green
Write-Host "  install.exe        -> $systemDir\install.exe" -ForegroundColor Cyan
Write-Host "  uninstall.exe      -> $dataDir\uninstall.exe" -ForegroundColor Cyan
Write-Host "  Abrir-MestreDoPC   -> $dataDir\Abrir-MestreDoPC.exe" -ForegroundColor Cyan
