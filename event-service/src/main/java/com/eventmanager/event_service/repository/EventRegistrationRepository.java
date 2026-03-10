package com.eventmanager.event_service.repository;

import com.eventmanager.event_service.domain.Event;
import com.eventmanager.event_service.domain.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    // Contar inscritos activos en un evento
    long countByEventAndCancelledFalse(Event event);

    // Verificar si un usuario está inscrito
    Optional<EventRegistration> findByEventAndUserIdAndCancelledFalse(Event event, Long userId);

    // Mis eventos (como asistente)
    List<EventRegistration> findByUserIdAndCancelledFalseOrderByRegisteredAtDesc(Long userId);

    // Asistentes de un evento (para el organizador)
    List<EventRegistration> findByEventAndCancelledFalseOrderByRegisteredAtAsc(Event event);
}
