@echo off
setlocal enabledelayedexpansion
echo ========================================================
echo          DETENIENDO MICROSERVICIOS
echo ========================================================
echo.
echo Verificando PowerShell...
powershell -NoProfile -Command "Write-Host 'PowerShell OK'" >nul 2>&1

if errorlevel 1 (
    echo [ERROR] PowerShell no encontrado.
    pause
    exit /b 1
)

echo [OK] Ejecutando Stop-All.ps1...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Stop-All.ps1"

if errorlevel 1 (
    echo.
    echo [ERROR] Error al detener servicios.
    pause
    exit /b 1
)

echo.
echo [OK] Todos los servicios detenidos correctamente.
echo [OK] Para reiniciar ejecuta: Iniciar-Proyecto.bat
echo.
pause
