package com.eventos.notification_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad que representa una notificación en la base de datos.
 * Cada notificación está asociada a un usuario y contiene el mensaje
 * enviado, el canal utilizado y la fecha de envío.
 * 
 * Principio SOLID aplicado:
 * - SRP: esta clase solo representa los datos de la notificación,
 *   no contiene lógica de negocio ni de envío de correo.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID del usuario que recibe la notificación (viene del auth-service)
    private Long userId;

    // Correo electrónico del usuario para el envío del email
    private String email;

    // Canal de notificación (EMAIL, SMS, etc.)
    private String channel;

    // Mensaje de la notificación
    @Column(length = 500)
    private String message;

    // Nombre del evento al que se inscribió el usuario
    private String eventName;

    // Fecha y hora en que se envió la notificación
    private LocalDateTime sentAt;
}