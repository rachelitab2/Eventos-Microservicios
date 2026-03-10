package com.eventos.notification_service.service;

import com.eventos.notification_service.dto.NotificationRequest;
import com.eventos.notification_service.dto.NotificationResponse;
import java.util.List;

/**
 * Interfaz que define el contrato del servicio de notificaciones.
 * Separa el contrato de la implementación siguiendo principios SOLID.
 *
 * Principio SOLID aplicado:
 * - ISP: interfaz específica con solo los métodos necesarios
 *   para el servicio de notificaciones.
 * - DIP: el controlador depende de esta abstracción,
 *   no de la implementación concreta.
 */
public interface NotificationService {

    // Crea una notificación, la guarda en BD y envía el correo
    NotificationResponse crearNotificacion(NotificationRequest request);

    // Obtiene todas las notificaciones de un usuario por su ID
    List<NotificationResponse> obtenerPorUsuario(Long userId);
}