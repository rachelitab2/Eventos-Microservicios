package com.eventos.event_service.repository;

import com.eventos.event_service.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Trae solo los eventos activos
    List<Event> findByActiveTrue();

    // Verifica si ya existe un evento con el mismo nombre y fecha
    boolean existsByNameAndEventDate(String name, java.time.LocalDateTime eventDate);
}