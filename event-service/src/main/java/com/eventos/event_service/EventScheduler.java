package com.eventos.event_service;

import com.eventos.event_service.entity.Event;
import com.eventos.event_service.repository.EventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Tarea programada que revisa eventos vencidos diariamente
 * Principio SRP: solo tiene la responsabilidad de gestionar eventos vencidos
 */
@Component
public class EventScheduler {

    private final EventRepository eventRepository;

    public EventScheduler(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    /**
     * Se ejecuta todos los días a las 00:00 (medianoche)
     * Busca eventos cuya fecha ya pasó y los marca como inactivos
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void desactivarEventosVencidos() {
        List<Event> eventosActivos = eventRepository.findByActiveTrue();

        int contador = 0;
        for (Event event : eventosActivos) {
            if (event.getEventDate().isBefore(LocalDateTime.now())) {
                event.setActive(false);
                eventRepository.save(event);
                contador++;
            }
        }

        if (contador > 0) {
            System.out.println("✅ " + contador + " evento(s) marcados como vencidos automáticamente.");
        } else {
            System.out.println("ℹ️ No hay eventos vencidos por procesar.");
        }
    }
}