package com.eventmanager.event_service.controller;

import com.eventmanager.event_service.domain.EventCategory;
import com.eventmanager.event_service.domain.EventRegistration;
import com.eventmanager.event_service.dto.CreateEventRequest;
import com.eventmanager.event_service.dto.EventResponse;
import com.eventmanager.event_service.dto.RegistrationRequest;
import com.eventmanager.event_service.service.EventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST de eventos.
 *
 * El usuario autenticado se identifica mediante headers inyectados por el
 * Gateway:
 * X-User-Id, X-User-Name, X-User-Role
 *
 * Base path: /events (configurado en Gateway como /api/events)
 */
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // =================== PÚBLICOS (cualquier usuario autenticado)
    // ===================

    /**
     * Lista todos los eventos publicados y futuros.
     * GET /api/events
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> listEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) EventCategory category) {
        List<EventResponse> events;
        if (keyword != null && !keyword.isBlank()) {
            events = eventService.searchEvents(keyword.trim());
        } else if (category != null) {
            events = eventService.listEventsByCategory(category);
        } else {
            events = eventService.listPublishedEvents();
        }
        return ResponseEntity.ok(events);
    }

    /**
     * Detalle de un evento.
     * GET /api/events/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventDetail(id));
    }

    /**
     * Inscribirse a un evento.
     * POST /api/events/{id}/register
     */
    @PostMapping("/{id}/register")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Void> register(
            @PathVariable Long id,
            @Valid @RequestBody RegistrationRequest request,
            HttpServletRequest req) {
        Long userId = extractUserId(req);
        eventService.registerToEvent(id, userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Cancelar mi inscripción a un evento.
     * DELETE /api/events/{id}/register
     */
    @DeleteMapping("/{id}/register")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable Long id,
            HttpServletRequest req) {
        Long userId = extractUserId(req);
        eventService.cancelRegistration(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Mis eventos como asistente.
     * GET /api/events/my-registrations
     */
    @GetMapping("/my-registrations")
    public ResponseEntity<List<EventResponse>> myRegistrations(HttpServletRequest req) {
        Long userId = extractUserId(req);
        return ResponseEntity.ok(eventService.getMyRegisteredEvents(userId));
    }

    // =================== ORGANIZER / ADMIN ===================

    /**
     * Crear un nuevo evento (en estado DRAFT).
     * POST /api/events
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        String organizerName = req.getHeader("X-User-Name");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(request, organizerId, organizerName));
    }

    /**
     * Editar un evento.
     * PUT /api/events/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody CreateEventRequest request,
            HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        return ResponseEntity.ok(eventService.updateEvent(id, request, organizerId));
    }

    /**
     * Publicar un evento (DRAFT → PUBLISHED).
     * PATCH /api/events/{id}/publish
     */
    @PatchMapping("/{id}/publish")
    public ResponseEntity<EventResponse> publishEvent(
            @PathVariable Long id,
            HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        return ResponseEntity.ok(eventService.publishEvent(id, organizerId));
    }

    /**
     * Cancelar un evento.
     * PATCH /api/events/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<EventResponse> cancelEvent(
            @PathVariable Long id,
            HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        return ResponseEntity.ok(eventService.cancelEvent(id, organizerId));
    }

    /**
     * Eliminar un evento (solo en estado DRAFT).
     * DELETE /api/events/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        eventService.deleteEvent(id, organizerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Mis eventos como organizador.
     * GET /api/events/my-events
     */
    @GetMapping("/my-events")
    public ResponseEntity<List<EventResponse>> myEvents(HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        return ResponseEntity.ok(eventService.getMyOrganizerEvents(organizerId));
    }

    /**
     * Lista de asistentes de un evento.
     * GET /api/events/{id}/attendees
     */
    @GetMapping("/{id}/attendees")
    public ResponseEntity<List<EventRegistration>> getAttendees(
            @PathVariable Long id,
            HttpServletRequest req) {
        Long organizerId = extractUserId(req);
        return ResponseEntity.ok(eventService.getEventAttendees(id, organizerId));
    }

    // =================== HELPERS ===================

    /**
     * Extrae el userId del header inyectado por el Gateway.
     * Si no existe, lanza excepción (el Gateway debe garantizar este header).
     */
    private Long extractUserId(HttpServletRequest req) {
        String userIdHeader = req.getHeader("X-User-Id");
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new RuntimeException("Header X-User-Id no encontrado. ¿Pasaste por el Gateway?");
        }
        return Long.parseLong(userIdHeader);
    }
}
