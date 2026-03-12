Write-Host 'Iniciando Docker Compose (MySQL)...'
docker-compose up -d mysql
Start-Sleep -Seconds 15

$services = @(
  @{ name='gateway'; path='gateway'; port=8080 },
  @{ name='auth-service'; path='auth-service'; port=8081 },
  @{ name='user-service'; path='user-service'; port=8082 },
  @{ name='event-service'; path='event-service'; port=8083 },
  @{ name='inscrip-service'; path='inscrip-service'; port=8084 },
  @{ name='notification-service'; path='notification-service'; port=8085 }
)

foreach ($svc in $services) {
  Write-Host "Iniciando $($svc.name) en puerto $($svc.port)..."
  Start-Process powershell -ArgumentList "-NoExit -Command "cd $($svc.path); .\mvnw spring-boot:run""
  Start-Sleep -Seconds 5
}

Write-Host 'Iniciando Frontend en puerto 3000...'
Start-Process powershell -ArgumentList "-NoExit -Command "cd frontend; python -m http.server 3000""

Write-Host '¡Todos los servicios han sido lanzados en ventanas separadas!'
