# 👤 GUÍA DE INTEGRACIÓN — RACHEL
> **Componentes a cargo:** `auth-service/`
> **Rama de trabajo:** `feature/rachel-auth-service`
> **Rol adicional:** Coordinadora general del proyecto

---

## 📁 ARCHIVOS QUE SON TU RESPONSABILIDAD

```
auth-service/
├── src/
│   └── main/
│       ├── java/com/eventos/auth_service/
│       │   ├── AuthServiceApplication.java
│       │   ├── config/
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   └── HealthController.java
│       │   ├── dto/
│       │   │   ├── AuthResponse.java
│       │   │   ├── LoginRequest.java
│       │   │   └── RegisterRequest.java
│       │   ├── entity/
│       │   │   └── User.java
│       │   ├── repository/
│       │   │   └── UserRepository.java
│       │   └── service/
│       │       └── AuthService.java
│       └── resources/
│           └── application.properties
├── .mvn/
├── pom.xml
└── mvnw / mvnw.cmd
```

> ℹ️ `notification-service/` fue reasignado a **Yadfridel** — ver [06_YADFRIDEL.md](06_YADFRIDEL.md)

---

## 🔧 PRE-REQUISITOS

Antes de ejecutar cualquier comando, verifica:

```bash
# Verificar Git instalado
git --version
# Debe mostrar: git version 2.x.x

# Verificar Java
java -version
# Debe mostrar: openjdk version "17.x.x"

# Verificar que tienes acceso al repositorio
git remote -v
# Debe mostrar la URL del repo de GitHub del proyecto
```

---

## 📋 PASO A PASO COMPLETO

### PASO 1 — Clonar el repositorio (solo si no lo tienes)

```bash
# Reemplaza [URL_DEL_REPO] con la URL real del repositorio GitHub
git clone [URL_DEL_REPO]
cd Eventos-Microservicios
```

### PASO 2 — Configurar tu identidad Git

```bash
git config user.name "Rachel"
git config user.email "tu-email@gmail.com"
```

### PASO 3 — Asegurarte de estar en develop actualizada

```bash
git checkout develop
git pull origin develop
```

### PASO 4 — Crear tu rama de trabajo

```bash
git checkout -b feature/rachel-auth-service
```

Verifica que estás en la rama correcta:
```bash
git branch
# Debe mostrar: * feature/rachel-auth-service
```

### PASO 5 — Hacer tus cambios (editar código normalmente)

Trabaja en los archivos de `auth-service/` y `notification-service/` como de costumbre usando tu editor/IDE.

### PASO 6 — Agregar SOLO TUS archivos al staging

> ⚠️ **CRÍTICO:** Nunca uses `git add .` ni `git add -A`. Solo agrega tus carpetas.

```bash
# Agregar auth-service completo
git add auth-service/

# VERIFICAR que solo se agregaron tus archivos
git status
```

**Salida esperada de `git status`:**
```
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   auth-service/src/main/java/...
        modified:   auth-service/src/main/resources/application.properties
        ...

# NO debe aparecer nada de: event-service/, user-service/, gateway/,
# inscrip-service/, frontend-v2/, notification-service/
```

Si aparece algo que no es tuyo, quítalo:
```bash
git restore --staged [archivo-que-no-es-tuyo]
```

### PASO 7 — Hacer commit

```bash
git commit -m "feat(auth): auth-service completo con JWT y seguridad

- login, registro, SecurityConfig, JWT
- UserRepository, User entity
- application.properties configurado para Railway MySQL (auth_db)"
```

### PASO 8 — Subir tu rama a GitHub

**Primera vez (sin force push):**
```bash
git push -u origin feature/rachel-auth-service
```

**Si necesitas subir cambios adicionales:**
```bash
git push origin feature/rachel-auth-service
```

**Si necesitas force push (para sobreescribir):**
```bash
# --force-with-lease es MÁS SEGURO que --force
# Solo sobreescribe si nadie más ha hecho push después de ti
git push origin feature/rachel-auth-service --force-with-lease
```

> ⚠️ **Cuándo usar force push:**
> - Si ya subiste algo incorrecto y necesitas corregirlo
> - Si reescribiste el historial con `git rebase`
> - NUNCA en ramas `develop` o `main`

### PASO 9 — Verificar lo que subiste en GitHub

1. Ve a GitHub → tu repositorio
2. Selecciona la rama `feature/rachel-auth-service`
3. Verifica que solo aparecen carpetas `auth-service/` y `notification-service/`
4. Revisa que los archivos son los correctos

### PASO 10 — Crear el Pull Request

**Por GitHub UI:**
1. Ve a tu repositorio en GitHub
2. Clic en **"Compare & pull request"** (aparece automáticamente)
3. Configura:
   - **Base:** `develop`
   - **Compare:** `feature/rachel-auth-service`
   - **Título:** `feat(auth): auth-service completo`
   - **Descripción:**
     ```
     ## Cambios incluidos
     - auth-service: registro, login, JWT authentication, SecurityConfig

     ## Archivos modificados
     - auth-service/ (completo)

     ## Pruebas realizadas
     - [ ] auth-service compila correctamente
     - [ ] Login funciona
     - [ ] Registro funciona
     ```
4. Clic en **"Create Pull Request"**

**Por CLI (alternativa):**
```bash
gh pr create \
  --base develop \
  --head feature/rachel-auth-service \
  --title "feat(auth): auth-service completo" \
  --body "auth-service completo: JWT, login, registro, SecurityConfig, conectado a auth_db en Railway MySQL"
```

---

## 🔄 SI HAY ACTUALIZACIONES POSTERIORES

Si necesitas agregar más cambios después del primer push:

```bash
# 1. Asegúrate de estar en tu rama
git checkout feature/rachel-auth-service

# 2. Haz tus cambios

# 3. Agrega solo tus archivos
git add auth-service/
git add notification-service/

# 4. Nuevo commit
git commit -m "fix(auth): corrección en [descripción del fix]"

# 5. Push normal (el PR se actualiza automáticamente)
git push origin feature/rachel-auth-service
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### "Your branch is behind origin/develop"
```bash
git checkout develop
git pull origin develop
git checkout feature/rachel-auth-service
git merge develop
# Resolver conflictos si los hay
git push origin feature/rachel-auth-service
```

### "Permission denied" al hacer push
```bash
# Verificar autenticación
git remote -v
# Si es HTTPS, puede pedir usuario/token de GitHub
# Si es SSH, verifica tu clave SSH: ssh -T git@github.com
```

### "Rejected - non-fast-forward"
```bash
# Usa force-with-lease (seguro)
git push origin feature/rachel-auth-service --force-with-lease
```

### Accidentalmente hice add de archivos que no son míos
```bash
# Quitar del staging (NO modifica el archivo, solo lo saca del área de preparación)
git restore --staged event-service/
git restore --staged user-service/
git restore --staged gateway/
git restore --staged inscrip-service/
git restore --staged frontend-v2/
```

---

## ✅ CHECKLIST PERSONAL — RACHEL

### Antes de subir
- [ ] Estoy en la rama `feature/rachel-auth-service`
- [ ] `auth-service/` compila: `cd auth-service && ./mvnw package -DskipTests`
- [ ] Solo `auth-service/` está en staging (`git status` verificado)
- [ ] El commit tiene un mensaje descriptivo

### Al crear el PR
- [ ] Base: `develop` ✓
- [ ] Compare: `feature/rachel-auth-service` ✓
- [ ] Descripción del PR completada
- [ ] PR creado exitosamente

### Como coordinadora, después de todos los PRs
- [ ] Todos los PRs mergeados a `develop`
- [ ] `develop` funciona localmente (prueba con `Iniciar-Proyecto.bat`)
- [ ] PR `develop` → `main` creado y aprobado
- [ ] Tag `v1.0.0` creado en `main`

---

## 📌 INFORMACIÓN TÉCNICA DE TU SERVICIO

**auth-service:**
- Puerto: `8081`
- Base de datos: `auth_db` (Railway MySQL)
- Endpoints principales:
  - `POST /auth/register` — Registro de usuarios
  - `POST /auth/login` — Login (retorna JWT)
  - `GET /auth/health` — Health check

---

*Guía preparada para: Rachel | Proyecto: Eventos-Microservicios | 2026-03-13*
