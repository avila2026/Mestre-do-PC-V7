@echo off
chcp 65001 > nul
title Mestre do PC V7 - Iniciando...

echo.
echo  ==================================================
echo   MESTRE DO PC V7 - Iniciando Servidor Admin...
echo  ==================================================
echo.
echo  Aguarde, elevando privilegios e iniciando servidor...
echo.

REM Tenta PowerShell 7 primeiro, depois fallback para o PowerShell 5 nativo do Windows
where pwsh.exe > nul 2>&1
if %ERRORLEVEL% == 0 (
    start "" pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0MestreDoPC-Launcher.ps1"
) else (
    start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0MestreDoPC-Launcher.ps1"
)

REM Aguarda 2 segundos e abre o HTML no navegador padrao
timeout /t 2 /nobreak > nul
start "" "%~dp0MestreDoPC-Ultimate-v7.html"

exit
