package com.eventos.notification_service.service;

import com.eventos.notification_service.dto.NotificationRequest;
import com.eventos.notification_service.dto.NotificationResponse;
import com.eventos.notification_service.email.EmailSender;
import com.eventos.notification_service.entity.Notification;
import com.eventos.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de notificaciones.
 * Orquesta el guardado en base de datos y el envío del correo,
 * pero delega cada responsabilidad a su clase correspondiente.
 *
 * Principio SOLID aplicado:
 * - SRP: esta clase solo orquesta el flujo de notificaciones,
 *   no implementa el envío de correo ni el acceso a datos directamente.
 * - DIP: depende de abstracciones (NotificationRepository, EmailSender)
 *   inyectadas por constructor con Lombok.
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailSender emailSender;

    /**
     * Crea una notificación, la persiste en la base de datos
     * y envía el correo de confirmación al usuario.
     *
     * @param request datos de la notificación enviados por el frontend
     * @return respuesta con los datos de la notificación creada
     */
    @Override
    public NotificationResponse crearNotificacion(NotificationRequest request) {

        // Construimos la entidad con los datos del request
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .eventName(request.getEventName())
                .message(request.getMessage())
                .channel("EMAIL")
                .sentAt(LocalDateTime.now())
                .build();

        // Guardamos la notificación en la base de datos
        Notification guardada = notificationRepository.save(notification);

        // Enviamos el correo de confirmación si hay email disponible
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            emailSender.enviarConfirmacion(
                    request.getEmail(),
                    request.getEventName(),
                    request.getMessage()
            );
        }

        // Retornamos la respuesta con los datos guardados
        return mapearRespuesta(guardada);
    }

    /**
     * Obtiene todas las notificaciones de un usuario específico.
     *
     * @param userId ID del usuario
     * @return lista de notificaciones del usuario
     */
    @Override
    public List<NotificationResponse> obtenerPorUsuario(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::mapearRespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad Notification en un NotificationResponse.
     * Método privado de mapeo para mantener el código limpio.
     *
     * @param notification entidad a convertir
     * @return DTO de respuesta
     */
    private NotificationResponse mapearRespuesta(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .email(notification.getEmail())
                .eventName(notification.getEventName())
                .message(notification.getMessage())
                .channel(notification.getChannel())
                .sentAt(notification.getSentAt())
                .build();
    }
}