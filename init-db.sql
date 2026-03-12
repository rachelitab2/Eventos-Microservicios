-- ══════════════════════════════════════════════════════════════
--  Pura Vida PC — Inicialización de bases de datos
--  Este archivo se ejecuta automáticamente al levantar MySQL
--  con Docker. Crea las 5 BDs necesarias.
-- ══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS event_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS inscrip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Permisos completos para root desde cualquier host (necesario para los contenedores)
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root123';
FLUSH PRIVILEGES;
