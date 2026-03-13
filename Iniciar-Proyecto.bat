@echo off
setlocal enabledelayedexpansion

cls
echo ════════════════════════════════════════════════════════════════
echo                   INICIANDO MICROSERVICIOS
echo ════════════════════════════════════════════════════════════════
echo.
echo Verificando requisitos del sistema...
echo.

:: Verificar PowerShell
powershell -NoProfile -Command "Write-Host 'PowerShell OK'" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PowerShell no encontrado. Instala PowerShell 5.1+
    pause
    exit /b 1
)

echo [OK] PowerShell detectado
echo [OK] Lanzando servicios en background...
echo.
echo ════════════════════════════════════════════════════════════════
echo                 Los servicios se inician sin ventanas
echo                 Veras un dashboard con el estado de cada uno
echo ════════════════════════════════════════════════════════════════
echo.

:: Ejecutar Start-All.ps1 sin pause para que el dashboard sea el foco
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-All.ps1"

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo al iniciar servicios.
    pause
    exit /b 1
)

exit /b 0
