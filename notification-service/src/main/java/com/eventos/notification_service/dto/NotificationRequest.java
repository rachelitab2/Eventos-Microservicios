package com.eventos.notification_service.dto;

import lombok.Data;

/**
 * DTO de entrada para crear una notificación.
 * Contiene los datos que el frontend envía cuando
 * un usuario se inscribe a un evento.
 *
 * Principio SOLID aplicado:
 * - SRP: esta clase solo representa los datos de entrada,
 *   no contiene lógica de negocio ni de persistencia.
 */
@Data
public class NotificationRequest {

    // ID del usuario que se inscribió (viene del sessionStorage)
    private Long userId;

    // Correo del usuario para enviar la confirmación (viene del sessionStorage)
    private String email;

    // Nombre del evento al que se inscribió
    private String eventName;

    // Mensaje personalizado de confirmación
    private String message;
}