param(
    [string]$InstallDir = "C:\MestreDoPC_V7",
    [string]$ShortcutName = "Mestre do PC V7.lnk"
)

$ErrorActionPreference = "Stop"

$desktop = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)
$shortcutPath = Join-Path $desktop $ShortcutName
$targetPath = Join-Path $InstallDir "Abrir-MestreDoPC.exe"
$iconPath = Join-Path $InstallDir "icon.ico"

if (-not (Test-Path -LiteralPath $targetPath)) {
    throw "Executavel nao encontrado: $targetPath"
}

if (-not (Test-Path -LiteralPath $iconPath)) {
    throw "Icone nao encontrado: $iconPath"
}

$shell = $null
$shortcut = $null

try {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $targetPath
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.IconLocation = "$iconPath,0"
    $shortcut.Save()
}
finally {
    if ($shortcut -ne $null) {
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($shortcut)
    }

    if ($shell -ne $null) {
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)
    }
}

if (-not (Test-Path -LiteralPath $shortcutPath)) {
    throw "Falha ao criar atalho: $shortcutPath"
}

Write-Host "[OK] Atalho criado: $shortcutPath" -ForegroundColor Green
