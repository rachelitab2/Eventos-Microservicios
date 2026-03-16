package com.eventos.event_service.service;

import com.eventos.event_service.dto.EventMapper;
import com.eventos.event_service.dto.EventRequest;
import com.eventos.event_service.dto.EventResponse;
import com.eventos.event_service.entity.Event;
import com.eventos.event_service.exception.EventNotFoundException;
import com.eventos.event_service.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación de la lógica de negocio de eventos
 * Principio SRP: solo gestiona lógica relacionada a eventos
 * Principio DIP: depende de abstracciones, no de clases concretas
 */
@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    // Inyección por constructor (buena práctica SOLID)
    public EventServiceImpl(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    // Registra un nuevo evento en la base de datos
    @Override
    public EventResponse createEvent(EventRequest request) {
        Event event = eventMapper.toEntity(request);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    // Lista todos los eventos activos
    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findByActiveTrue()
                .stream()
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Busca un evento por ID, lanza excepción si no existe
    @Override
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return eventMapper.toResponse(event);
    }

    // Disminuye los cupos disponibles de un evento por ID
    @Override
    public EventResponse decreaseSpots(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        
        if (event.getAvailableSpots() > 0) {
            event.setAvailableSpots(event.getAvailableSpots() - 1);
            event = eventRepository.save(event);
        } else {
            throw new IllegalStateException("No available spots for this event");
        }
        
        return eventMapper.toResponse(event);
    }

    @Override
    public EventResponse increaseSpots(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        int totalCapacity = event.getTotalCapacity() == null ? Integer.MAX_VALUE : event.getTotalCapacity();
        int availableSpots = event.getAvailableSpots() == null ? 0 : event.getAvailableSpots();

        if (availableSpots < totalCapacity) {
            event.setAvailableSpots(availableSpots + 1);
            event = eventRepository.save(event);
        }

        return eventMapper.toResponse(event);
    }

    // Actualiza un evento existente con nuevos datos
    @Override
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        // Actualiza todos los campos del evento
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setTotalCapacity(request.getTotalCapacity());
        event.setCategory(request.getCategory());
        event.setPrice(request.getPrice());
        event.setImageUrl(request.getImageUrl());
        event.setInstagramUrl(request.getInstagramUrl());
        event.setInstagramUser(request.getInstagramUser());
        event.setFacebookUrl(request.getFacebookUrl());
        event.setFacebookUser(request.getFacebookUser());
        event.setWhatsappNumber(request.getWhatsappNumber());
        event.setTiktokUrl(request.getTiktokUrl());
        event.setTiktokUser(request.getTiktokUser());

        Event updatedEvent = eventRepository.save(event);
        return eventMapper.toResponse(updatedEvent);
    }

    // Elimina un evento marcándolo como inactivo (soft delete)
    @Override
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setActive(false);
        eventRepository.save(event);
    }

    // Lista TODOS los eventos (activos e inactivos) - solo para admin
    @Override
    public List<EventResponse> getAllEventsAdmin() {
        return eventRepository.findAll()
                .stream()
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Alterna el estado activo/inactivo de un evento
    @Override
    public EventResponse toggleEventActive(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setActive(!event.isActive());
        Event saved = eventRepository.save(event);
        return eventMapper.toResponse(saved);
    }
}
