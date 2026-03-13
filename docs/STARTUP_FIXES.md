# 🔧 Soluciones Aplicadas al Startup Script

## ❌ Problemas Identificados

### 1. **Validación de JARs Faltante**
**Problema:** El script lanzaba `Start-Process` sin verificar que los archivos JAR existieran
- Si un JAR estaba corrupto o faltaba, el proceso fallaba silenciosamente
- No había salida clara sobre qué estaba mal

**Solución:** Agregamos validación previa de todos los JARs
```powershell
foreach ($svc in $services) {
  $jarPath = "$ROOT\$($svc.jar)"
  if (-not (Test-Path $jarPath)) {
    Write-Fail "JAR no encontrado: $jarPath"
  }
}
```

---

### 2. **Sintaxis Incorrecta de ArgumentList**
**Problema:** El `ArgumentList` en `Start-Process` estaba mal formado
```powershell
# ❌ ANTES (INCORRECTO)
$javaArgs = "java -jar '$jarPath'" + 
            " --spring.datasource.url='$jdbcUrl'" +
            " --spring.datasource.username=$DB_USER" +
            " --spring.datasource.password=$DB_PASSWORD"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $javaArgs
```
- Las variables de entorno no se expandían correctamente
- Algunos caracteres especiales en las contraseñas causaban parsing errors

**Solución:** Construir el comando como string único
```powershell
# ✅ DESPUÉS (CORRECTO)
$javaCmd = "cd '$ROOT'; java -jar '$jarPath' --spring.datasource.url='$jdbcUrl' --spring.datasource.username=$DB_USER --spring.datasource.password=$DB_PASSWORD"

Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", $javaCmd
```

---

### 3. **Falta de Error Handling**
**Problema:** Si `Start-Process` fallaba, no había try-catch
- El script continuaba como si nada
- El usuario no sabía qué servicio falló

**Solución:** Envolver en try-catch
```powershell
try {
  Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", $javaCmd -ErrorAction Stop
  Write-Ok "$($svc.name) lanzado en puerto $($svc.port)"
} catch {
  Write-Fail "No se pudo lanzar $($svc.name): $_"
}
```

---

### 4. **BAT sin Validación de PowerShell**
**Problema:** El `Iniciar-Proyecto.bat` no verificaba si PowerShell estaba disponible
- En sistemas sin PowerShell o con restricciones, fallaría sin razón clara

**Solución:** Validar PowerShell y mejorar mensajes de error
```batch
powershell -NoProfile -Command "Write-Host 'PowerShell OK'" >nul 2>&1

if errorlevel 1 (
    echo [ERROR] PowerShell no encontrado. Instala PowerShell 5.1+
    pause
    exit /b 1
)
```

---

### 5. **Falta de `-NoProfile` Flag**
**Problema:** Sin este flag, PowerShell ejecuta el perfil de usuario que puede
- Agregar delays innecesarios
- Setear variables de entorno conflictivas
- Causar errores de ejecución

**Solución:** Agregar `-NoProfile` a todos los llamados de PowerShell

---

## ✅ Cambios Realizados

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Validación de JARs** | ❌ Ninguna | ✅ Valida todos antes de lanzar |
| **Sintaxis ArgumentList** | ❌ Múltiples strings concatenados | ✅ String único bien formado |
| **Error Handling** | ❌ Ninguno | ✅ Try-catch en cada lanzamiento |
| **PowerShell Flags** | ❌ Solo `-ExecutionPolicy` | ✅ `-NoProfile`, `-ExecutionPolicy`, `-NoExit` |
| **BAT Validation** | ❌ Sin verificación | ✅ Valida PowerShell disponible |
| **Mensajes de Error** | ❌ Genéricos | ✅ Específicos y claros |

---

## 🚀 Cómo Ejecutar Ahora

### Opción 1: Doble clic (Recomendado)
```
Doble clic en: Iniciar-Proyecto.bat
```

### Opción 2: PowerShell manual
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\Start-All.ps1
```

### Opción 3: Línea de comando
```cmd
Iniciar-Proyecto.bat
```

---

## 📋 Checklist de Inicio

Cuando ejecutes el script, verás:
- ✅ Verificación de Java y Node.js
- ✅ Validación de todos los JARs compilados
- ✅ Lanzamiento de Frontend v2 (Vite)
- ✅ Lanzamiento de 6 microservicios con Railway DB
- ✅ Resumen final con URLs

---

## 🔐 Credenciales Railway

Las credenciales están codificadas en el script:
```
Host:     shinkansen.proxy.rlwy.net:37791
Usuario:  root
Password: UtYYbWKKZnfIGkALRiPnDnsLuXPLYQzj
```

Cada microservicio conecta a su base de datos:
- `auth_db`
- `user_db`
- `event_db`
- `inscrip_db`
- `notification_db`

---

## 🆘 Si Aún Hay Problemas

1. **"PowerShell no encontrado"**
   - Instala PowerShell 5.1+: https://github.com/PowerShell/PowerShell/releases

2. **"Java no detectado"**
   - Instala JDK 17+: https://jdk.java.net/
   - Asegúrate que Java esté en tu PATH

3. **"JAR no encontrado"**
   - Ejecuta: `mvnw clean package -DskipTests` en cada carpeta de microservicio

4. **"Node no encontrado"**
   - Instala Node 18+: https://nodejs.org/

---

## 📊 Resultado Esperado

```
========================================================
         PROYECTO INICIADO CORRECTAMENTE
========================================================
  Frontend v2      ->  http://localhost:5173
  Gateway (API)    ->  http://localhost:8080
  auth-service     ->  :8081
  user-service     ->  :8082
  event-service    ->  :8083
  inscrip-service  ->  :8084
  notification-svc ->  :8085
========================================================
✓ Espera ~30-60 seg a que cada servicio arranque.
✓ Todas las ventanas permanecerán abiertas en background.
========================================================
```

Luego abre: **http://localhost:5173**
