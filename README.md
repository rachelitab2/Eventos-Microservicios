# Eventos Microservicios

Proyecto universitario para gestion de eventos presenciales en Bavaro y Punta Cana con arquitectura de microservicios.

## Estado actual
- Base inicial de 5 microservicios Spring Boot.
- Una base de datos por servicio.
- Configuracion preparada para MySQL con Docker Compose.
- Flujo minimo recomendado para entrega: registro, login, listar eventos, inscribirse, ver mis eventos.

## Microservicios
- `auth-service`: registro, login, JWT.
- `user-service`: perfil de usuario.
- `event-service`: eventos y cupos.
- `inscrip-service`: inscripciones y mis eventos.
- `notification-service`: opcional, correos.

## Puertos
- `auth-service`: 8081
- `user-service`: 8082
- `event-service`: 8083
- `inscrip-service`: 8084
- `notification-service`: 8085
- `mysql`: 3306

## Base de datos
Se usa un solo contenedor MySQL con 5 bases separadas:
- `auth_db`
- `user_db`
- `event_db`
- `inscrip_db`
- `notification_db`

## Levantar MySQL
```powershell
docker compose up -d
```

Verificar:
```powershell
docker ps
```

## Arrancar servicios
En cada carpeta de servicio:
```powershell
.\mvnw.cmd spring-boot:run
```

Si el wrapper falla en una maquina, instalar Maven global y usar:
```powershell
mvn spring-boot:run
```

## Orden recomendado de implementacion
1. `auth-service`
2. `user-service`
3. `event-service`
4. `inscrip-service`
5. `frontend`
6. `notification-service`

## Flujo Git recomendado
- `main`: entrega estable.
- `develop`: integracion.
- `feature/nombre-tarea`: trabajo individual.

Ver guia completa en `docs/TEAM_WORKFLOW.md`.

## Siguiente objetivo funcional
1. Registrar usuario.
2. Iniciar sesion.
3. Listar eventos.
4. Inscribirse.
5. Ver mis eventos.
