package com.eventos.event_service.controller;

import com.eventos.event_service.dto.EventRequest;
import com.eventos.event_service.dto.EventResponse;
import com.eventos.event_service.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controlador REST del microservicio de eventos
 * Principio SRP: solo maneja peticiones HTTP y delega al servicio
 * Principio DIP: depende de la interfaz EventService
 */
@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    // Inyección por constructor
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * POST /events
     * Crea un nuevo evento
     */
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@RequestBody EventRequest request) {
        EventResponse response = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /events
     * Lista todos los eventos activos
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * GET /events/{id}
     * Detalle de un evento específico
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        EventResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /events/{id}/decrease-spots
     * Disminuye un cupo del evento
     */
    @PutMapping("/{id}/decrease-spots")
    public ResponseEntity<EventResponse> decreaseSpots(@PathVariable Long id) {
        try {
            EventResponse response = eventService.decreaseSpots(id);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * PUT /events/{id}/increase-spots
     * Restaura un cupo disponible del evento
     */
    @PutMapping("/{id}/increase-spots")
    public ResponseEntity<EventResponse> increaseSpots(@PathVariable Long id) {
        EventResponse response = eventService.increaseSpots(id);
        return ResponseEntity.ok(response);
    }
}
