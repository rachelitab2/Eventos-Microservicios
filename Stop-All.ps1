# ============================================================
#  Stop-All.ps1  — Apaga todos los servicios del proyecto
#  COMO EJECUTAR:
#    Doble clic en  Detener-Proyecto.bat
#    O en PowerShell:  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#                       .\Stop-All.ps1
# ============================================================

function Write-Step { param($msg) Write-Host "`n[>>] $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "    [!!] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "    [ERROR] $msg" -ForegroundColor Red; exit 1 }

$ports = @(
  @{ name='gateway';              port=8080 },
  @{ name='auth-service';         port=8081 },
  @{ name='user-service';         port=8082 },
  @{ name='event-service';        port=8083 },
  @{ name='inscrip-service';      port=8084 },
  @{ name='notification-service'; port=8085 },
  @{ name='frontend-v2';          port=5173 }
)

Write-Step "Deteniendo procesos en puertos del proyecto..."

$stoppedCount = 0
$alreadyFreeCount = 0

foreach ($svc in $ports) {
    try {
        $matches = (netstat -ano 2>$null | Select-String ":$($svc.port)\s.*LISTENING" | ForEach-Object { $_ -replace '.*LISTENING\s+', '' } | ForEach-Object { $_.Trim() } | Select-Object -Unique)
        
        if ($matches) {
            foreach ($procId in $matches) {
                if ($procId -match '^\d+$' -and [int]$procId -gt 0) {
                    $proc = Get-Process -Id ([int]$procId) -ErrorAction SilentlyContinue
                    if ($proc) {
                        Stop-Process -Id ([int]$procId) -Force -ErrorAction Stop
                        Write-Ok "Detenido: $($svc.name) ($($proc.ProcessName) PID $procId) en puerto $($svc.port)"
                        $stoppedCount++
                    }
                }
            }
        } else {
            Write-Warn "Puerto $($svc.port) ($($svc.name)) ya estaba libre."
            $alreadyFreeCount++
        }
    } catch {
        Write-Warn "Error al procesar puerto $($svc.port): $_"
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         TODOS LOS SERVICIOS DETENIDOS                 " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Servicios detenidos:  $stoppedCount" -ForegroundColor Green
Write-Host "  Puertos ya libres:    $alreadyFreeCount" -ForegroundColor Yellow
Write-Host "  Total puertos:        $($ports.Count)" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Puertos liberados: 8080 8081 8082 8083 8084 8085 5173 " -ForegroundColor White
Write-Host "  Para reiniciar ejecuta: .\Start-All.ps1              " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
