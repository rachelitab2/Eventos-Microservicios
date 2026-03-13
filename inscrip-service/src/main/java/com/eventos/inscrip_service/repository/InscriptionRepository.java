package com.eventos.inscrip_service.repository;

import com.eventos.inscrip_service.entity.Inscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repositorio InscriptionRepository
 * Propósito: Interface que extiende JpaRepository para manejar el acceso a datos.
 * Provee métodos CRUD automáticos y consultas personalizadas hacia la tabla 'inscriptions'.
 */
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    // Propósito: Recuperar todas las inscripciones asociadas a un usuario específico.
    // Spring Data JPA genera la consulta SQL automáticamente basándose en el nombre del método.
    List<Inscription> findByUserIdAndStatusNot(Long userId, String status);

    // Propósito: Verificar si un usuario ya existe en un evento determinado.
    // Es clave para cumplir la regla de negocio de "Evitar Duplicados".
    boolean existsByUserIdAndEventIdAndStatusNot(Long userId, Long eventId, String status);

    long countByEventIdAndStatusNot(Long eventId, String status);
}
