# 🎫 DOCUMENTACIÓN TÉCNICA - MICROSERVICIO DE INSCRIPCIONES

| 📋 CAMPO | 🔍 DETALLE |
| :--- | :--- |
| **Integrante** | Eliana |
| **Microservicio** | `inscrip-service` |
| **Puerto** | `8084` |
| **Base de Datos** | `inscrip_db` |
| **Rama Git** | `Eliana-inscrip-service` |
| **Fecha** | 07 de Marzo, 2026 |

---

## 1. 📝 Descripción General

El microservicio `inscrip-service` es el núcleo transaccional del sistema, encargado de la relación entre usuarios y eventos en el ecosistema de **Punta Cana / Bávaro**. Su propósito es garantizar un registro seguro, único y trazable de la asistencia.

### Responsabilidades Clave:
1.  **Validación Transaccional:** Asegurar que cada registro sea integro.
2.  **Prevención de Duplicados:** Garantizar que un usuario no se inscriba dos veces al mismo evento.
3.  **Gestión de Estados:** Controlar el flujo de la inscripción (PENDING, CONFIRMED, CANCELLED).
4.  **Historial de Usuario:** Proveer acceso rápido a las actividades pasadas del usuario.
5.  **Auditoría:** Mantener marcas temporales precisas de cada acción.
6.  **Disponibilidad:** Reportar datos en tiempo real para el control de aforo.

> [!IMPORTANT]
> **Cumplimiento de Principios SOLID:**
> 1. **S - Single Responsibility Principle (SRP):** Cada clase tiene una única razón para cambiar. `InscriptionController` solo maneja el tráfico HTTP, `InscriptionService` solo contiene lógica de negocio y `InscriptionRepository` solo gestiona persistencia.
> 2. **O - Open/Closed Principle (OCP):** El sistema permite extensiones (como nuevos tipos de tickets o estados) sin modificar el código base, gracias al uso de DTOs y una arquitectura desacoplada.
> 3. **L - Liskov Substitution Principle (LSP):** Se cumple mediante el uso de `JpaRepository`. Cualquier implementación de la interfaz de repositorio puede sustituirse sin alterar el comportamiento esperado del servicio.
> 4. **I - Interface Segregation Principle (ISP):** Las interfaces (como `InscriptionRepository`) son específicas y solo contienen los métodos necesarios para la entidad `Inscription`, evitando que las clases dependan de métodos que no utilizan.
> 5. **D - Dependency Inversion Principle (DIP):** Las dependencias de alto nivel (`Service`) dependen de abstracciones (`Repository`) y no de implementaciones concretas, facilitando la inyección de dependencias mediante Lombok (`@RequiredArgsConstructor`).

---

## 2. 📂 Estructura del Proyecto

Se ha seguido una arquitectura limpia por capas para facilitar el mantenimiento y escalabilidad.

| 📄 ARCHIVO | 🛠️ CAPA / TIPO | 🎯 FUNCIÓN PRINCIPAL |
| :--- | :--- | :--- |
| `Inscription.java` | **Entity** | Mapeo de la tabla `inscriptions` en MySQL. |
| `InscriptionRepository.java` | **Repository** | Consultas JPA y validaciones de existencia. |
| `InscriptionService.java` | **Service** | Lógica de negocio, validaciones y orquestación. |
| `InscriptionController.java` | **Controller** | Exposición de Endpoints RESTful. |
| `InscriptionRequest.java` | **DTO (Input)** | Validación de datos de entrada vía request. |
| `InscriptionResponse.java` | **DTO (Output)** | Estructura de respuesta limpia para el cliente. |
| `InscriptionMapper.java` | **Mapper** | Conversión entre Entidades y DTOs. |
| `GlobalExceptionHandler.java` | **Exceptions** | Manejo centralizado de errores HTTP. |
| `InscriptionException.java` | **Exceptions** | Excepción personalizada para errores de negocio. |
| `InscripServiceApplication.java` | **Main** | Punto de entrada del microservicio Spring Boot. |

---

## 3. � Modelo de Datos (Entidad)

La entidad `Inscription` incluye campos de negocio, medios y auditoría avanzada.

| 🔑 CAMPO | 🛠️ TIPO | 📝 DESCRIPCIÓN |
| :--- | :--- | :--- |
| `id` | `Long` | Identificador único (Primary Key). |
| `userId` | `Long` | ID del usuario (Referencia Externa). |
| `eventId` | `Long` | ID del evento (Referencia Externa). |
| `status` | `String` | Estado (CONFIRMED, CANCELLED). |
| `inscriptionDate` | `LDT` | Fecha y hora de la inscripción. |
| `notes` | `String` | Observaciones adicionales del asistente. |
| `paymentRef` | `String` | Referencia de pago para eventos premium. |
| `paymentStatus` | `String` | Estado del pago (PAID, PENDING). |
| `ticketType` | `String` | Tipo de entrada (VIP, GENERAL). |
| `qrCodeUrl` | `String` | URL de la imagen del ticket generado (S3/Local). |
| `socialHandle` | `String` | Red social para networking en el evento. |
| `imageUrl` | `String` | Foto del comprobante o badge del usuario. |
| `checkInDone` | `Boolean` | Flag de asistencia confirmada en puerta. |
| `createdAt` | `LDT` | Timestamp de creación (Auditoría). |
| `updatedAt` | `LDT` | Timestamp de última modificación. |

---

## 4. 🚀 Endpoints de la API

### 🟢 GET /inscriptions/user/{userId}
Obtiene todas las inscripciones de un usuario específico.

**Ejemplo de Respuesta:**
```json
[
  {
    "id": 1,
    "userId": 501,
    "eventId": 10,
    "inscriptionDate": "2026-03-07T14:30:00",
    "status": "CONFIRMED",
    "qrCodeUrl": "https://cdn.events.pc/qrs/T-123.png"
  }
]
```

### 🔵 POST /inscriptions
Registra una nueva inscripción en el sistema.

**Cuerpo de la Petición (Request):**
```json
{
  "userId": 501,
  "eventId": 12,
  "notes": "Asistiré con mi equipo de desarrollo",
  "ticketType": "VIP"
}
```

---

## 5. � Flujo de Ejecución

Proceso lógico desde la petición hasta la persistencia.

| 📶 PASO | 🏗️ COMPONENTE | 🛠️ ACCIÓN REALIZADA |
| :--- | :--- | :--- |
| 1 | **Controller** | Recibe el JSON y valida el formato con `@Valid`. |
| 2 | **Service** | Llama al Repositorio para verificar duplicados. |
| 3 | **Repository** | Ejecuta `existsByUserIdAndEventId`. |
| 4 | **Service** | Si no existe, instancia la Entidad usando el **Pattern Builder**. |
| 5 | **Entity** | Se asignan timestamps de auditoría automáticamente. |
| 6 | **Repository** | Persiste el objeto en la base de datos `inscrip_db`. |
| 7 | **Mapper** | Transforma la entidad guardada en un `InscriptionResponse`. |

---

## 6. 📊 Datos Iniciales (Seed Data)

Registros realistas para pruebas en el área de Punta Cana.

| ID | User | Evento | Estado | Lugar Referencia |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 101 | CONFIRMED | Blue Mall PC |
| 2 | 2 | 101 | CONFIRMED | Blue Mall PC |
| 3 | 1 | 105 | CANCELLED | Hard Rock Hotel |
| 4 | 3 | 102 | CONFIRMED | Cocobongo Show |
| 5 | 4 | 103 | PENDING | Downtown Bávaro |
| 6 | 5 | 101 | CONFIRMED | Blue Mall PC |
| 7 | 2 | 104 | CONFIRMED | Punta Cana Village |
| 8 | 1 | 106 | CONFIRMED | Playa Blanca |
| 9 | 6 | 102 | CONFIRMED | Cocobongo Show |
| 10 | 7 | 107 | CONFIRMED | Cap Cana Marina |

---

## 7. ⚠️ Manejo de Errores

Ejemplo de respuesta de error cuando el usuario ya está inscrito:

```json
{
  "timestamp": "2026-03-07T16:20:00",
  "status": 400,
  "error": "Bad Request",
  "message": "El usuario ya está inscrito en este evento",
  "path": "/api/inscriptions"
}
```

| 💻 CÓDIGO | 🏷️ ERROR | 📝 DESCRIPCIÓN |
| :--- | :--- | :--- |
| `400` | Duplicado | El usuario ya posee un registro para ese evento. |
| `404` | Not Found | El ID de inscripción solicitado no existe. |
| `500` | DB Error | Error de conexión con el servidor MySQL. |

---

## 8. ⚙️ Configuración del Sistema

Extracto de `application.properties`:

| 🛠️ PROPIEDAD | 🔍 VALOR |
| :--- | :--- |
| `server.port` | `8084` |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/inscrip_db` |
| `spring.datasource.username` | `root` |
| `spring.datasource.password` | `root123` |
| `hibernate.ddl-auto` | `update` |

---

## 9. 🧪 Pruebas Realizadas

| 🧪 TEST | 🎯 OBJETIVO | ✅ ESTADO |
| :--- | :--- | :--- |
| **Unit Test: Create** | Validar creación de entidad. | **PASÓ** |
| **Integración: DB** | Conexión exitosa a MySQL. | **PASÓ** |
| **Lógica: No Duplicados** | Bloquear doble inscripción. | **PASÓ** |
| **REST: Get User** | Listado de historial de usuario. | **PASÓ** |

---

## 10. 📦 Entregables de Eliana

Lista de verificación final de la **Fase 2**.

| 📁 ITEM | ✅ ESTADO |
| :--- | :--- |
| Repositorio Git actualizado | √ Completado |
| Entidad JPA creada | √ Completado |
| Repositorio con consultas personalizadas | √ Completado |
| Lógica de Servicio implementada | √ Completado |
| Controlador REST con 2 endpoints | √ Completado |
| DTOs para solicitudes | √ Completado |
| DTOs para respuestas | √ Completado |
| Validación de duplicados funcional | √ Completado |
| Puerto 8084 configurado | √ Completado |
| Conexión a `inscrip_db` lista | √ Completado |
| Scripts SQL de prueba creados | √ Completado |
| Manejo de auditoría básica (Fechas) | √ Completado |
| Documentación técnica (Este archivo) | √ Completado |
| Código libre de errores de compilación | √ Completado |

---
*© 2026 Proyecto Eventos Microservicios - Eliana*
