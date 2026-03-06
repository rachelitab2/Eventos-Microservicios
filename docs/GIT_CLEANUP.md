# Limpieza de Git

El repositorio tuvo servicios generados dentro de carpetas duplicadas como `auth-service/auth-service`.
La estructura valida es la carpeta de primer nivel, por ejemplo `auth-service/`.

## Si el estado muestra rutas anidadas en `AD`
Ejecutar en la raiz del repo:
```powershell
git rm --cached -r auth-service/auth-service
git rm --cached -r event-service/event-service
git rm --cached -r inscrip-service/inscrip-service
git rm --cached -r notification-service/notification-service
```

## Luego agregar la estructura correcta
```powershell
git add auth-service event-service inscrip-service notification-service user-service frontend README.md docker-compose.yml infra docs .gitignore
```

## Verificar
```powershell
git status
```

## Commit recomendado
```powershell
git commit -m "chore: reorganiza estructura base del proyecto"
```
