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
}