package com.eventmanager.event_service.repository;

import com.eventmanager.event_service.domain.Event;
import com.eventmanager.event_service.domain.EventCategory;
import com.eventmanager.event_service.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Eventos públicos publicados y futuros
    List<Event> findByStatusAndStartDateAfterOrderByStartDateAsc(EventStatus status, LocalDateTime now);

    // Filtrar por categoría y estado
    List<Event> findByStatusAndCategoryOrderByStartDateAsc(EventStatus status, EventCategory category);

    // Eventos de un organizador
    List<Event> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId);

    // Búsqueda por texto en título o descripción
    @Query("SELECT e FROM Event e WHERE e.status = :status AND " +
            "(LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Event> searchByKeyword(@Param("status") EventStatus status, @Param("keyword") String keyword);
}
