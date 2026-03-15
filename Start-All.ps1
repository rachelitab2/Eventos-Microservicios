# ============================================================
#  Start-All.ps1  — Levanta todo el proyecto localmente
#  COMO EJECUTAR:
#    Doble clic en  Iniciar-Proyecto.bat
#    O en PowerShell:  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#                       .\Start-All.ps1
#  Frontend v2  →  http://localhost:5173
#  Gateway      →  http://localhost:8080  (proxy de todos los servicios)
#  Servicios    →  8081 auth | 8082 user | 8083 event | 8084 inscrip | 8085 notification
#  Base de datos →  Railway MySQL (público)
# ============================================================

$ROOT = Split-Path $PSScriptRoot -Parent

function Write-Step  { param($msg) Write-Host "`n[>>] $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "    [!!] $msg" -ForegroundColor Yellow }
function Write-Fail  { param($msg) Write-Host "    [ERROR] $msg" -ForegroundColor Red; exit 1 }

$ROOT = Split-Path $PSScriptRoot -Parent

# ─────────────────────────────────────────────────────────────────────────────
#  1. VERIFICAR PREREQS
# ─────────────────────────────────────────────────────────────────────────────
Write-Step "Verificando requisitos del sistema..."

# Java
$javaCheck = Get-Command java -ErrorAction SilentlyContinue
if (-not $javaCheck) { Write-Fail "Java no encontrado. Instala JDK 17+ y asegurate de que este en el PATH." }
$jv = (java -version 2>&1 | Select-Object -First 1).ToString()
Write-Ok "Java detectado: $jv"

# Node / npm (OPCIONAL - solo si usas frontend-v2)
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) { 
    Write-Warn "Node.js no encontrado (opcional). Frontend v2 no se iniciara."
    $skipFrontend = $true
} else {
    $nv = (node --version 2>&1).ToString(); $npmv = (npm --version 2>&1).ToString()
    Write-Ok "Node $nv  /  npm $npmv"
    $skipFrontend = $false
}

# ─────────────────────────────────────────────────────────────────────────────
#  2. FRONTEND-V2  —  instalar deps si faltan y arrancar en background (OPCIONAL)
# ─────────────────────────────────────────────────────────────────────────────
if (-not $skipFrontend) {
    Write-Step "Preparando Frontend v2..."

    $frontendDir = "$ROOT\frontend-v2"

    if (-not (Test-Path "$frontendDir\node_modules")) {
        Write-Warn "node_modules no encontrado. Ejecutando npm install..."
        Push-Location $frontendDir
        npm install
        Pop-Location
        Write-Ok "Dependencias instaladas."
    } else {
        Write-Ok "node_modules ya existe, saltando npm install."
    }

    Write-Warn "Lanzando npm run dev en ventana separada..."
    $frontendCmd = "Set-Location '$frontendDir'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
    Write-Ok "Frontend v2 lanzado -> http://localhost:5173  (abrira en ~5s)"
} else {
    Write-Host ""
    Write-Host "NOTA: Frontend v2 saltado (Node.js no disponible)" -ForegroundColor Yellow
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────────
#  3. MICROSERVICIOS  —  compilar si faltan JARs y arrancar
# ─────────────────────────────────────────────────────────────────────────────

# ── Configuración Railway MySQL (base de datos compartida en la nube) ─────────
#    El frontend-v2 consume los microservicios a través del GATEWAY en :8080
#    Vite proxea /api → http://localhost:8080  (ver frontend-v2/vite.config.ts)
#    Cada microservicio se conecta a esta DB de Railway:
$DB_HOST     = "shinkansen.proxy.rlwy.net"
$DB_PORT     = "37791"
$DB_USER     = "root"
$DB_PASSWORD = "UtYYbWKKZnfIGkALRiPnDnsLuXPLYQzj"
$DB_OPTS     = "useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"

$services = @(
  @{ name='gateway';              jar='gateway\target\api-gateway-0.0.1-SNAPSHOT.jar';                         mvn='gateway';              db=$null;            port=8080 },
  @{ name='auth-service';         jar='auth-service\target\auth-service-0.0.1-SNAPSHOT.jar';                   mvn='auth-service';         db='auth_db';        port=8081 },
  @{ name='user-service';         jar='user-service\target\user-service-0.0.1-SNAPSHOT.jar';                   mvn='user-service';         db='user_db';        port=8082 },
  @{ name='event-service';        jar='event-service\target\event-service-0.0.1-SNAPSHOT.jar';                 mvn='event-service';        db='event_db';       port=8083 },
  @{ name='inscrip-service';      jar='inscrip-service\target\inscrip-service-0.0.1-SNAPSHOT.jar';             mvn='inscrip-service';      db='inscrip_db';     port=8084 },
  @{ name='notification-service'; jar='notification-service\target\notification-service-0.0.1-SNAPSHOT.jar';   mvn='notification-service'; db='notification_db';port=8085 }
)

Write-Step "Verificando JARs compilados..."

foreach ($svc in $services) {
  $jarPath = "$ROOT\$($svc.jar)"

  if (-not (Test-Path $jarPath)) {
    Write-Warn "$($svc.name) — JAR no encontrado. Compilando con Maven Wrapper..."
    Push-Location "$ROOT\$($svc.mvn)"
    .\mvnw package -DskipTests -q
    if ($LASTEXITCODE -ne 0) { Write-Fail "Fallo compilacion de $($svc.name)" }
    Pop-Location
    Write-Ok "$($svc.name) compilado."
  } else {
    Write-Ok "$($svc.name) — JAR listo."
  }
}

Write-Step "Validando que todos los JARs existen..."

foreach ($svc in $services) {
  $jarPath = "$ROOT\$($svc.jar)"
  if (-not (Test-Path $jarPath)) {
    Write-Fail "JAR no encontrado: $jarPath"
  }
}
Write-Ok "Todos los JARs validados exitosamente."

Write-Step "Lanzando microservicios en background (sin ventanas)..."

# Crear carpeta de logs si no existe
$logsDir = "$ROOT\.logs"
if (-not (Test-Path $logsDir)) {
  New-Item -ItemType Directory -Path $logsDir | Out-Null
}

foreach ($svc in $services) {
  $jarPath = "$ROOT\$($svc.jar)"
  $logFile = "$logsDir\$($svc.name)_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

  if ($svc.db) {
    $jdbcUrl  = "jdbc:mysql://${DB_HOST}:${DB_PORT}/$($svc.db)?${DB_OPTS}"
    $javaCmd = "cd '$ROOT'; java -jar '$jarPath' --spring.datasource.url='$jdbcUrl' --spring.datasource.username=$DB_USER --spring.datasource.password=$DB_PASSWORD 2>&1 | Out-File -FilePath '$logFile' -Append -Encoding UTF8"
  } else {
    $javaCmd = "cd '$ROOT'; java -jar '$jarPath' 2>&1 | Out-File -FilePath '$logFile' -Append -Encoding UTF8"
  }

  try {
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", $javaCmd -WindowStyle Hidden -ErrorAction Stop
    Write-Ok "$($svc.name) lanzado en puerto $($svc.port) (logs: $logFile)"
  } catch {
    Write-Fail "No se pudo lanzar $($svc.name): $_"
  }
  Start-Sleep -Seconds 1
}

# ─────────────────────────────────────────────────────────────────────────────
#  4. RESUMEN FINAL
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         PROYECTO INICIADO CORRECTAMENTE                " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Frontend v2      ->  http://localhost:5173            " -ForegroundColor White
Write-Host "  Gateway (API)    ->  http://localhost:8080            " -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  Microservicios (via Gateway en /api/...):             " -ForegroundColor Gray
Write-Host "    auth-service         ->  :8081  /auth/**            " -ForegroundColor Gray
Write-Host "    user-service         ->  :8082  /users/**           " -ForegroundColor Gray
Write-Host "    event-service        ->  :8083  /events/**          " -ForegroundColor Gray
Write-Host "    inscrip-service      ->  :8084  /inscriptions/**    " -ForegroundColor Gray
Write-Host "    notification-service ->  :8085  /notifications/**   " -ForegroundColor Gray
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  Base de datos    ->  Railway MySQL (nube)             " -ForegroundColor White
Write-Host "  BD Host          ->  shinkansen.proxy.rlwy.net:37791  " -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  FLUJO: Browser -> Vite:5173 -> /api (proxy) ->       " -ForegroundColor Yellow
Write-Host "         Gateway:8080 -> Microservicio -> Railway DB   " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "           SERVICIOS LANZADOS EN BACKGROUND" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [OK] Todos los servicios iniciados sin ventanas" -ForegroundColor Green
Write-Host "  [INFO] Logs guardados en: .logs/" -ForegroundColor Yellow
Write-Host "  [WAIT] Aguardando disponibilidad de servicios..." -ForegroundColor Yellow
Write-Host ""
Write-Host ""

# Llamar al Monitor
. "$ROOT\Monitor-Services.ps1" -CheckInterval 5 -MaxWaitSeconds 120
