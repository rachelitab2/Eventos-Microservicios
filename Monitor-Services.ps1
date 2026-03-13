# Monitor-Services.ps1 - Simple Dashboard

param([int]$CheckInterval = 5, [int]$MaxWaitSeconds = 120)

$services = @(
    @{ name='gateway';              port=8080 },
    @{ name='auth-service';         port=8081 },
    @{ name='user-service';         port=8082 },
    @{ name='event-service';        port=8083 },
    @{ name='inscrip-service';      port=8084 },
    @{ name='notification-service'; port=8085 },
    @{ name='frontend-v2';          port=5173 }
)

Clear-Host
Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "           MONITOREO DE SERVICIOS" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$monitoringComplete = $false
$elapsedSeconds = 0
$statuses = @{}

while ($elapsedSeconds -lt $MaxWaitSeconds) {
    Write-Host "  [TIME] Transcurrido: $($elapsedSeconds)s / $($MaxWaitSeconds)s" -ForegroundColor Yellow
    Write-Host "  ---------------------------------------------------" -ForegroundColor Cyan
    
    $upCount = 0
    
    foreach ($svc in $services) {
        try {
            $test = Test-NetConnection -ComputerName localhost -Port $svc.port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue -InformationLevel Quiet
            if ($test) {
                Write-Host "    [OK]  $($svc.name.PadRight(25)) PORT $($svc.port)" -ForegroundColor Green
                $statuses[$svc.name] = "OK"
                $upCount++
            } else {
                Write-Host "    [...] $($svc.name.PadRight(25)) PORT $($svc.port)" -ForegroundColor Yellow
                $statuses[$svc.name] = "INICIANDO"
            }
        } catch {
            Write-Host "    [...] $($svc.name.PadRight(25)) PORT $($svc.port)" -ForegroundColor Yellow
            $statuses[$svc.name] = "INICIANDO"
        }
    }
    
    Write-Host "  ---------------------------------------------------" -ForegroundColor Cyan
    $color = if ($upCount -eq $services.Count) { "Green" } else { "Yellow" }
    Write-Host "  Listos: $upCount/$($services.Count)" -ForegroundColor $color
    
    if ($upCount -eq $services.Count) {
        Clear-Host
        Write-Host ""
        Write-Host "======================================================" -ForegroundColor Green
        Write-Host "        TODOS LOS SERVICIOS DISPONIBLES" -ForegroundColor Green
        Write-Host "======================================================" -ForegroundColor Green
        Write-Host ""
        
        foreach ($svc in $services) {
            Write-Host "  [OK]  $($svc.name.PadRight(25)) localhost:$($svc.port)" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "  Frontend v2 .... http://localhost:5173" -ForegroundColor Cyan
        Write-Host "  API Gateway .... http://localhost:8080" -ForegroundColor Cyan
        Write-Host "  Base de Datos .. Railway MySQL (nube)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  [OK] Sistema listo en $($elapsedSeconds) segundos" -ForegroundColor Green
        Write-Host "  [INFO] Logs.... .logs/" -ForegroundColor Yellow
        Write-Host ""
        break
    }
    
    Start-Sleep -Seconds $CheckInterval
    $elapsedSeconds += $CheckInterval
    Clear-Host
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host "           MONITOREO DE SERVICIOS" -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host ""
}

if ($elapsedSeconds -ge $MaxWaitSeconds) {
    Clear-Host
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Red
    Write-Host "        TIMEOUT - Servicios sin responder" -ForegroundColor Red
    Write-Host "======================================================" -ForegroundColor Red
    Write-Host ""
    
    foreach ($svc in $services) {
        $status = $statuses[$svc.name]
        $color = if ($status -eq "OK") { "Green" } else { "Yellow" }
        Write-Host "    [$status] $($svc.name.PadRight(25)) PORT $($svc.port)" -ForegroundColor $color
    }
    
    Write-Host ""
}
