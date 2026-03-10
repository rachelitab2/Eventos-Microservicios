package com.eventos.notification_service.repository;

import com.eventos.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para acceder a los datos de las notificaciones.
 * Extiende JpaRepository para tener las operaciones CRUD básicas.
 *
 * Principio SOLID aplicado:
 * - SRP: esta interfaz solo se encarga del acceso a datos,
 *   no contiene lógica de negocio.
 * - DIP: el servicio depende de esta abstracción,
 *   no de una implementación concreta.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Obtiene todas las notificaciones de un usuario por su ID
    List<Notification> findByUserId(Long userId);
}