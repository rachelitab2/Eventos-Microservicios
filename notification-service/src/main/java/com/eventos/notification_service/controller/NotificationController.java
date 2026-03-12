package com.eventos.notification_service.controller;

import com.eventos.notification_service.dto.NotificationRequest;
import com.eventos.notification_service.dto.NotificationResponse;
import com.eventos.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controlador REST del servicio de notificaciones.
 * Expone los endpoints HTTP para crear y consultar notificaciones.
 *
 * Principio SOLID aplicado:
 * - SRP: esta clase solo maneja las peticiones HTTP,
 *   no contiene lógica de negocio ni acceso a datos.
 * - DIP: depende de la abstracción NotificationService,
 *   no de la implementación concreta.
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Crea una nueva notificación y envía el correo de confirmación.
     * El frontend llama a este endpoint después de una inscripción exitosa.
     *
     * POST /notifications
     *
     * @param request datos de la notificación
     * @return notificación creada con código 201
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> crearNotificacion(
            @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.crearNotificacion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene todas las notificaciones de un usuario específico.
     * El frontend usa este endpoint para mostrar el historial de notificaciones.
     *
     * GET /notifications/user/{userId}
     *
     * @param userId ID del usuario
     * @return lista de notificaciones del usuario
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> obtenerPorUsuario(
            @PathVariable Long userId) {
        List<NotificationResponse> notificaciones = notificationService.obtenerPorUsuario(userId);
        return ResponseEntity.ok(notificaciones);
    }
}