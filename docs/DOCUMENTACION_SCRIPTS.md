# 📚 Guía Completa de Scripts de Inicio y Apagado

## 🎯 Descripción General

Tu proyecto de microservicios ahora tiene scripts robustos y mejorados para:
- ✅ Iniciar todos los servicios con validación completa
- ✅ Apagar todos los servicios de forma segura
- ✅ Verificar prerequisites (Java, Node.js, PowerShell)
- ✅ Reportar errores claros y específicos

---

## 📂 Archivos Involucrados

### Inicio
- **`Iniciar-Proyecto.bat`** — Punto de entrada (doble clic para iniciar)
- **`Start-All.ps1`** — Script principal de PowerShell
- **`STARTUP_FIXES.md`** — Documentación de cambios en startup

### Apagado
- **`Detener-Proyecto.bat`** — Punto de entrada (doble clic para apagar)
- **`Stop-All.ps1`** — Script principal de PowerShell
- **`STOP_FIXES.md`** — Documentación de cambios en stop

---

## 🚀 INICIO RÁPIDO

### Opción 1: Windows Explorer (Recomendado)
1. **Iniciar**: Doble clic en `Iniciar-Proyecto.bat`
2. **Espera**: 30-60 segundos para que arranque todo
3. **Acceder**: `http://localhost:5173`

### Opción 2: PowerShell Manual
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\Start-All.ps1
```

### Opción 3: Línea de comandos
```cmd
Iniciar-Proyecto.bat
```

---

## 🛑 APAGADO RÁPIDO

### Opción 1: Windows Explorer
```
Doble clic en → Detener-Proyecto.bat
```

### Opción 2: PowerShell Manual
```powershell
.\Stop-All.ps1
```

### Opción 3: Task Manager
Manually kill any remaining `java.exe` or `node.exe` processes

---

## 📊 Componentes del Sistema

### Frontend
| Componente | URL | Tecnología |
|-----------|-----|-----------|
| Frontend v2 | http://localhost:5173 | Vite + TypeScript + React |

### Gateway
| Componente | Puerto | Tecnología |
|-----------|--------|-----------|
| Gateway (API) | 8080 | Spring Boot |

### Microservicios
| Servicio | Puerto | Base de Datos | Estado |
|---------|--------|---------------|--------|
| auth-service | 8081 | auth_db | JDBC |
| user-service | 8082 | user_db | JDBC |
| event-service | 8083 | event_db | JDBC |
| inscrip-service | 8084 | inscrip_db | JDBC |
| notification-service | 8085 | notification_db | JDBC |

### Base de Datos
| Aspecto | Valor |
|--------|-------|
| Host | shinkansen.proxy.rlwy.net |
| Puerto | 37791 |
| Usuario | root |
| Contraseña | UtYYbWKKZnfIGkALRiPnDnsLuXPLYQzj |
| Driver | Railway MySQL |

---

## 🔄 Flujo de Comunicación

```
NAVEGADOR (Browser)
    ↓
VITE (localhost:5173)
    ↓
Proxy: /api → localhost:8080
    ↓
GATEWAY (Port 8080)
    ↓
Rutas del Gateway:
  • /auth/** → auth-service (8081)
  • /users/** → user-service (8082)
  • /events/** → event-service (8083)
  • /inscriptions/** → inscrip-service (8084)
  • /notifications/** → notification-service (8085)
    ↓
MICROSERVICIO
    ↓
JDBC Connection
    ↓
RAILWAY MYSQL
```

---

## ✨ Validaciones Implementadas

### En Start-All.ps1
- ✅ Java 17+ detectado
- ✅ Node.js 18+ detectado
- ✅ npm disponible
- ✅ Todos los JAR compilados antes de lanzar
- ✅ Cada JAR validado con ruta absoluta
- ✅ Try-catch en cada lanzamiento
- ✅ Verificación de RPC flags correctos

### En Iniciar-Proyecto.bat
- ✅ PowerShell 5.1+ disponible
- ✅ Flags de ejecución correctos
- ✅ Error handling y reporting
- ✅ Exit codes apropiados

### En Stop-All.ps1
- ✅ Validación de puertos
- ✅ Identificación de procesos por PID
- ✅ Detención forzada con error handling
- ✅ Contadores de servicios detenidos
- ✅ Reporte de puertos ya libres

---

## 🆘 TROUBLESHOOTING

### Error: "Java no encontrado"
```
→ Instala JDK 17+: https://jdk.java.net/
→ Asegúrate de que java.exe esté en tu PATH
→ Verifica: java -version
```

### Error: "Node.js no encontrado"
```
→ Instala Node 18+: https://nodejs.org/
→ Verifica: node -v
```

### Error: "JAR no encontrado"
```
→ Ve a cada carpeta de microservicio
→ Ejecuta: mvnw clean package -DskipTests
```

### Error: "PowerShell no encontrado"
```
→ Instala PowerShell 5.1+
→ https://github.com/PowerShell/PowerShell/releases
```

### Puerto en uso
```
→ Ejecuta: netstat -ano | findstr :8080 (ejemplo con puerto 8080)
→ Identifica el PID
→ Ejecuta: taskkill /PID <PID> /F
```

### Conexión a Railway falla
```
→ Verifica credenciales en Start-All.ps1
→ Verifica que Railway esté up en dashboard
→ Prueba ping: ping shinkansen.proxy.rlwy.net
```

---

## 📈 Monitoreo de Servicios

### Verificar que todo está Up
```powershell
# Verificar puertos activos
netstat -ano | findstr LISTENING | findstr "808[0-5]\|5173"

# Verificar procesos Java
Get-Process java | Select-Object ProcessName, Id, WorkingSet

# Verificar procesos Node
Get-Process node | Select-Object ProcessName, Id, WorkingSet
```

### Health Check Manual
```powershell
# Gateway
Invoke-WebRequest http://localhost:8080/actuator/health -UseBasicParsing

# Microservicio específico (con timeout)
Invoke-WebRequest http://localhost:8081/actuator/health -TimeoutSec 5 -UseBasicParsing
```

---

## 🔐 Credenciales y Configuración

### Railway MySQL
```
Host:     shinkansen.proxy.rlwy.net:37791
Usuario:  root
Password: UtYYbWKKZnfIGkALRiPnDnsLuXPLYQzj
SSL:      false
Charset:  UTF-8
Timezone: UTC
```

### Connection String (JDBC)
```
jdbc:mysql://shinkansen.proxy.rlwy.net:37791/[DB_NAME]?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

## 📝 Logs y Debugging

### Ver logs de servicios
Cada servicio abre en su propia ventana PowerShell. Los logs aparecen en tiempo real.

### Detener un servicio específico
```powershell
# Por nombre
Stop-Process -Name java -ErrorAction SilentlyContinue

# Por puerto
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

---

## 🎓 Flujo de Desarrollo

```
1. INICIAR
   → Doble clic en Iniciar-Proyecto.bat
   → Espera 30-60 seg
   → Abre http://localhost:5173

2. DESARROLLAR
   → Edita código en frontend-v2/src
   → Vite recompila automáticamente (hot reload)
   → Cambios reflejados en navegador

3. MODIFICAR MICROSERVICIOS
   → Edita código en [servicio]/src
   → Ejecuta: mvnw clean package -DskipTests
   → Detén servicio: Stop-All.ps1
   → Vuelve a iniciar: Start-All.ps1

4. DETENER
   → Doble clic en Detener-Proyecto.bat
   → Todos los puertos se liberan

5. REINICIAR
   → Vuelve al paso 1
```

---

## 🎯 Puntos Clave

⭐ **Siempre ejecuta scripts como:**
- Doble clic en `.bat` (más fácil)
- O con `-ExecutionPolicy Bypass` en PowerShell

⭐ **Los servicios tardan 30-60 seg en responder**
- Frontend responde rápido (~5-10 seg)
- Microservicios en background (~30-60 seg)

⭐ **Base de datos en la nube**
- Todos los microservicios usan Railway MySQL
- Las ventanas permanecen abiertas mostrando logs en tiempo real

⭐ **Para detener:**
- Usa `Detener-Proyecto.bat` (limpio y ordenado)
- Evita cerrar ventanas manualmente (usa Stop-All.ps1)

---

## 📞 Soporte

Si algo falla, revisa en este orden:
1. Archivo de log del script (mostrado en terminal)
2. `STARTUP_FIXES.md` o `STOP_FIXES.md`
3. Verificación manual de prerequisites
4. Limpia puertos y reinicia: `Stop-All.ps1` → `Start-All.ps1`

---

**Última actualización**: 13 de Marzo, 2026
**Versión**: 2.0 (Mejorada con validaciones completas)
