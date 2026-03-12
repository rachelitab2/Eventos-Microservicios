FROM nginx:alpine
# Copiamos todos los archivos del frontend a la carpeta por defecto de nginx
COPY . /usr/share/nginx/html/
# Mantenemos el puerto 80 (Railway lo re-mappeará a su red automáticamente para servicios nginx simples)
EXPOSE 80
# Podemos incluir el comando default
CMD ["nginx", "-g", "daemon off;"]
