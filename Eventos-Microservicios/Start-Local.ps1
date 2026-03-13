# ─── Configuración Railway MySQL (público) ───────────────────────────────────
$DB_HOST     = "shinkansen.proxy.rlwy.net"
$DB_PORT     = "37791"
$DB_USER     = "root"
$DB_PASSWORD = "UtYYbWKKZnfIGkALRiPnDnsLuXPLYQzj"
$DB_OPTS     = "useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"

$root = $PSScriptRoot

# ─── Servicios: jar, db, puerto ──────────────────────────────────────────────
$services = @(
  @{ name='gateway';              jar='gateway\target\api-gateway-0.0.1-SNAPSHOT.jar';               db=$null;            port=8080 },
  @{ name='auth-service';         jar='auth-service\target\auth-service-0.0.1-SNAPSHOT.jar';         db='auth_db';        port=8081 },
  @{ name='user-service';         jar='user-service\target\user-service-0.0.1-SNAPSHOT.jar';         db='user_db';        port=8082 },
  @{ name='event-service';        jar='event-service\target\event-service-0.0.1-SNAPSHOT.jar';       db='event_db';       port=8083 },
  @{ name='inscrip-service';      jar='inscrip-service\target\inscrip-service-0.0.1-SNAPSHOT.jar';   db='inscrip_db';     port=8084 },
  @{ name='notification-service'; jar='notification-service\target\notification-service-0.0.1-SNAPSHOT.jar'; db='notification_db'; port=8085 }
)

foreach ($svc in $services) {
  Write-Host "Iniciando $($svc.name) en puerto $($svc.port)..."

  $jarPath = "$root\$($svc.jar)"

  if ($svc.db) {
    $jdbcUrl = "jdbc:mysql://${DB_HOST}:${DB_PORT}/$($svc.db)?${DB_OPTS}"
    $javaArgs = "java -jar '$jarPath' " +
                "--spring.datasource.url='$jdbcUrl' " +
                "--spring.datasource.username=$DB_USER " +
                "--spring.datasource.password=$DB_PASSWORD"
  } else {
    # gateway no necesita DB
    $javaArgs = "java -jar '$jarPath'"
  }

  Start-Process powershell -ArgumentList "-NoExit", "-Command", $javaArgs
  Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "========================================"
Write-Host " Microservicios lanzados en:"
Write-Host "   Gateway          → http://localhost:8080"
Write-Host "   auth-service     → http://localhost:8081"
Write-Host "   user-service     → http://localhost:8082"
Write-Host "   event-service    → http://localhost:8083"
Write-Host "   inscrip-service  → http://localhost:8084"
Write-Host "   notification     → http://localhost:8085"
Write-Host "   Frontend v2      → http://localhost:5173"
Write-Host "   DB (Railway)     → ${DB_HOST}:${DB_PORT}"
Write-Host "========================================"
Write-Host " Espera ~30-60s a que cada servicio arranque."
