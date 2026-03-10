package com.eventmanager.event_service.service;

import com.eventmanager.event_service.domain.*;
import com.eventmanager.event_service.dto.CreateEventRequest;
import com.eventmanager.event_service.dto.EventResponse;
import com.eventmanager.event_service.dto.RegistrationRequest;
import com.eventmanager.event_service.exception.EventException;
import com.eventmanager.event_service.repository.EventRegistrationRepository;
import com.eventmanager.event_service.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio central de gestión de eventos.
 *
 * Operaciones disponibles:
 * - Crear, editar, cancelar y publicar eventos (ORGANIZER/ADMIN)
 * - Listar y buscar eventos públicos (todos)
 * - Inscribirse, cancelar inscripción y ver mis eventos (USER)
 * - Ver la lista de asistentes de un evento (ORGANIZER/ADMIN)
 */
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    // ===================== ORGANIZER / ADMIN =====================

    /**
     * Crea un nuevo evento en estado DRAFT.
     * El organizador lo publica explícitamente después.
     */
    @Transactional
    public EventResponse createEvent(CreateEventRequest request, Long organizerId, String organizerName) {
        validateDates(request.getStartDate(), request.getEndDate());

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .status(EventStatus.DRAFT)
                .organizerId(organizerId)
                .organizerName(organizerName)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        event = eventRepository.save(event);
        return mapToResponse(event, 0L);
    }

    /**
     * Actualiza un evento existente. Solo el organizador dueño o un ADMIN puede
     * hacerlo.
     */
    @Transactional
    public EventResponse updateEvent(Long eventId, CreateEventRequest request, Long organizerId) {
        Event event = findEventOrThrow(eventId);
        validateOwnership(event, organizerId);
        validateDates(request.getStartDate(), request.getEndDate());

        long registered = registrationRepository.countByEventAndCancelledFalse(event);
        if (request.getCapacity() < registered) {
            throw new EventException("La nueva capacidad (" + request.getCapacity() +
                    ") no puede ser menor que los ya inscritos (" + registered + ").");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setLocation(request.getLocation());
        event.setCapacity(request.getCapacity());
        event.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(event, registered);
    }

    /**
     * Publica un evento (DRAFT → PUBLISHED).
     */
    @Transactional
    public EventResponse publishEvent(Long eventId, Long organizerId) {
        Event event = findEventOrThrow(eventId);
        validateOwnership(event, organizerId);

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new EventException("Solo se pueden publicar eventos en estado DRAFT.");
        }

        event.setStatus(EventStatus.PUBLISHED);
        event.setUpdatedAt(LocalDateTime.now());

        long registered = registrationRepository.countByEventAndCancelledFalse(event);
        return mapToResponse(event, registered);
    }

    /**
     * Cancela un evento. Notifica implícitamente (en el futuro, con messaging).
     */
    @Transactional
    public EventResponse cancelEvent(Long eventId, Long organizerId) {
        Event event = findEventOrThrow(eventId);
        validateOwnership(event, organizerId);

        if (event.getStatus() == EventStatus.FINISHED) {
            throw new EventException("No se puede cancelar un evento que ya terminó.");
        }

        event.setStatus(EventStatus.CANCELLED);
        event.setUpdatedAt(LocalDateTime.now());

        long registered = registrationRepository.countByEventAndCancelledFalse(event);
        return mapToResponse(event, registered);
    }

    /**
     * Elimina un evento (solo si está en DRAFT).
     */
    @Transactional
    public void deleteEvent(Long eventId, Long organizerId) {
        Event event = findEventOrThrow(eventId);
        validateOwnership(event, organizerId);

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new EventException("Solo se pueden eliminar eventos en estado DRAFT.");
        }

        eventRepository.delete(event);
    }

    /**
     * Lista todos los eventos de un organizador.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getMyOrganizerEvents(Long organizerId) {
        return eventRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId)
                .stream()
                .map(e -> mapToResponse(e, registrationRepository.countByEventAndCancelledFalse(e)))
                .toList();
    }

    /**
     * Lista todos los asistentes inscritos a un evento.
     */
    @Transactional(readOnly = true)
    public List<EventRegistration> getEventAttendees(Long eventId, Long organizerId) {
        Event event = findEventOrThrow(eventId);
        validateOwnership(event, organizerId);
        return registrationRepository.findByEventAndCancelledFalseOrderByRegisteredAtAsc(event);
    }

    // ===================== USUARIO (público) =====================

    /**
     * Lista todos los eventos publicados y futuros.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> listPublishedEvents() {
        return eventRepository
                .findByStatusAndStartDateAfterOrderByStartDateAsc(EventStatus.PUBLISHED, LocalDateTime.now())
                .stream()
                .map(e -> mapToResponse(e, registrationRepository.countByEventAndCancelledFalse(e)))
                .toList();
    }

    /**
     * Filtra eventos por categoría.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> listEventsByCategory(EventCategory category) {
        return eventRepository
                .findByStatusAndCategoryOrderByStartDateAsc(EventStatus.PUBLISHED, category)
                .stream()
                .map(e -> mapToResponse(e, registrationRepository.countByEventAndCancelledFalse(e)))
                .toList();
    }

    /**
     * Busca eventos por palabra clave en título o descripción.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> searchEvents(String keyword) {
        return eventRepository
                .searchByKeyword(EventStatus.PUBLISHED, keyword)
                .stream()
                .map(e -> mapToResponse(e, registrationRepository.countByEventAndCancelledFalse(e)))
                .toList();
    }

    /**
     * Detalle de un evento.
     */
    @Transactional(readOnly = true)
    public EventResponse getEventDetail(Long eventId) {
        Event event = findEventOrThrow(eventId);
        long registered = registrationRepository.countByEventAndCancelledFalse(event);
        return mapToResponse(event, registered);
    }

    /**
     * Inscribir a un usuario en un evento.
     */
    @Transactional
    public void registerToEvent(Long eventId, Long userId, RegistrationRequest request) {
        Event event = findEventOrThrow(eventId);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El evento está cancelado.");
        }
        if (event.getStatus() == EventStatus.FULL) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El evento está completo.");
        }
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El evento no está disponible para inscripciones.");
        }

        // Verificar si el usuario ya está inscrito
        registrationRepository.findByEventAndUserIdAndCancelledFalse(event, userId)
                .ifPresent(r -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya estás inscrito en este evento.");
                });

        long registered = registrationRepository.countByEventAndCancelledFalse(event);
        if (registered >= event.getCapacity()) {
            event.setStatus(EventStatus.FULL);
            eventRepository.save(event);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No hay lugares disponibles.");
        }

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .userId(userId)
                .userName(request.getUserName())
                .userEmail(request.getUserEmail())
                .registrationCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .registeredAt(LocalDateTime.now())
                .cancelled(false)
                .build();

        registrationRepository.save(registration);

        // Actualizar estado si se llenó
        if (registered + 1 >= event.getCapacity()) {
            event.setStatus(EventStatus.FULL);
            eventRepository.save(event);
        }
    }

    /**
     * Cancelar inscripción de un usuario.
     */
    @Transactional
    public void cancelRegistration(Long eventId, Long userId) {
        Event event = findEventOrThrow(eventId);

        EventRegistration registration = registrationRepository
                .findByEventAndUserIdAndCancelledFalse(event, userId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No estás inscrito en este evento."));

        registration.setCancelled(true);
        registration.setCancelledAt(LocalDateTime.now());
        registrationRepository.save(registration);

        // Si el evento estaba lleno, vuelve a PUBLISHED al liberarse un lugar
        if (event.getStatus() == EventStatus.FULL) {
            event.setStatus(EventStatus.PUBLISHED);
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.save(event);
        }
    }

    /**
     * Lista los eventos en los que está inscrito un usuario.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getMyRegisteredEvents(Long userId) {
        return registrationRepository
                .findByUserIdAndCancelledFalseOrderByRegisteredAtDesc(userId)
                .stream()
                .map(r -> mapToResponse(r.getEvent(),
                        registrationRepository.countByEventAndCancelledFalse(r.getEvent())))
                .toList();
    }

    // ===================== PRIVADOS =====================

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado con ID: " + id));
    }

    private void validateOwnership(Event event, Long organizerId) {
        if (!event.getOrganizerId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para modificar este evento.");
        }
    }

    private void validateDates(LocalDateTime start, LocalDateTime end) {
        if (end.isBefore(start) || end.isEqual(start)) {
            throw new EventException("La fecha de fin debe ser posterior a la de inicio.");
        }
    }

    private EventResponse mapToResponse(Event event, long registered) {
        int available = (int) Math.max(0, event.getCapacity() - registered);
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .location(event.getLocation())
                .capacity(event.getCapacity())
                .registeredCount(registered)
                .availableSpots(available)
                .status(event.getStatus())
                .organizerId(event.getOrganizerId())
                .organizerName(event.getOrganizerName())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
