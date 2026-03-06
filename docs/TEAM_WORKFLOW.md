# Flujo de trabajo del equipo

## 1. Estructura del repositorio
Cada servicio se trabaja en su propia carpeta:
- `auth-service`
- `user-service`
- `event-service`
- `inscrip-service`
- `notification-service`
- `frontend`

## 2. Ramas
- `main`: entrega final.
- `develop`: integracion del equipo.
- `feature/auth-service`
- `feature/user-service`
- `feature/event-service`
- `feature/inscrip-service`
- `feature/frontend`
- `feature/notification-service`

## 3. Regla del equipo
Nadie trabaja directamente en `main`.
Nadie mezcla dos modulos grandes en una sola rama.
Cada integrante hace `pull` de `develop` antes de empezar.

## 4. Flujo diario
```powershell
git checkout develop
git pull origin develop
git checkout -b feature/nombre-tarea
```

Trabajar, luego:
```powershell
git add .
git commit -m "feat: descripcion corta"
git push -u origin feature/nombre-tarea
```

Despues abrir Pull Request hacia `develop`.

## 5. Delegacion sugerida para 5 personas
### Persona 1
- Lider tecnico
- Integra ramas
- Revisa Pull Request
- Mantiene README y docker-compose

### Persona 2
- `auth-service`
- registro
- login
- JWT

### Persona 3
- `user-service`
- perfil de usuario
- consulta de usuario

### Persona 4
- `event-service`
- listado de eventos
- detalle del evento
- cupos disponibles

### Persona 5
- `inscrip-service`
- inscribirse
- validar cupos
- mis eventos
- apoyo a `frontend`

## 6. Endpoints minimos por servicio
### auth-service
- `POST /auth/register`
- `POST /auth/login`

### user-service
- `GET /users/{id}`
- `PUT /users/{id}`

### event-service
- `GET /events`
- `GET /events/{id}`

### inscrip-service
- `POST /inscriptions`
- `GET /inscriptions/user/{userId}`

## 7. Orden real de entrega
1. MySQL con Docker.
2. Servicios arrancando.
3. Endpoints basicos.
4. Pruebas con Postman.
5. Frontend HTML/CSS/JS.
6. Dockerizacion completa.
7. CI/CD basico.
