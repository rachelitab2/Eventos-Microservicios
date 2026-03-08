package com.eventos.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO de salida para devolver la notificación creada.
 * Define los datos que el frontend recibe como confirmación
 * después de que se procesa y envía la notificación.
 *
 * Principio SOLID aplicado:
 * - SRP: esta clase solo representa los datos de salida,
 *   no contiene lógica de negocio ni de persistencia.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    // ID interno de la notificación generada
    private Long id;

    // ID del usuario que recibió la notificación
    private Long userId;

    // Correo al que se envió la notificación
    private String email;

    // Nombre del evento de la inscripción
    private String eventName;

    // Mensaje enviado
    private String message;

    // Canal utilizado (EMAIL)
    private String channel;

    // Fecha y hora en que se envió
    private LocalDateTime sentAt;
}