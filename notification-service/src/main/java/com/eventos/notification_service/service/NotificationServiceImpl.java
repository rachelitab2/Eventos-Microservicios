package com.eventos.notification_service.service;

import com.eventos.notification_service.dto.NotificationRequest;
import com.eventos.notification_service.dto.NotificationResponse;
import com.eventos.notification_service.email.EmailSender;
import com.eventos.notification_service.entity.Notification;
import com.eventos.notification_service.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

/**
 * Implementacion del servicio de notificaciones.
 * Orquesta el guardado en base de datos y delega el correo
 * a un ejecutor dedicado para no bloquear la respuesta HTTP.
 */
@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailSender emailSender;
    private final Executor mailTaskExecutor;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            EmailSender emailSender,
            @Qualifier("mailTaskExecutor") Executor mailTaskExecutor
    ) {
        this.notificationRepository = notificationRepository;
        this.emailSender = emailSender;
        this.mailTaskExecutor = mailTaskExecutor;
    }

    @Override
    public NotificationResponse crearNotificacion(NotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .eventName(request.getEventName())
                .message(request.getMessage())
                .channel("EMAIL")
                .sentAt(LocalDateTime.now())
                .build();

        long startDb = System.currentTimeMillis();
        Notification guardada = notificationRepository.save(notification);
        log.info("Notificacion guardada en DB. Tiempo: {}ms", System.currentTimeMillis() - startDb);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            programarCorreo(request.getEmail(), request.getEventName(), request.getMessage());
        }

        return mapearRespuesta(guardada);
    }

    @Override
    public List<NotificationResponse> obtenerPorUsuario(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::mapearRespuesta)
                .collect(Collectors.toList());
    }

    private void programarCorreo(String email, String eventName, String message) {
        try {
            mailTaskExecutor.execute(() -> emailSender.enviarConfirmacion(email, eventName, message));
            log.info("Envio de correo programado para {}", email);
        } catch (Exception e) {
            log.error("No se pudo programar el correo para {}", email, e);
        }
    }

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
