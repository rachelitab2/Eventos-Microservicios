package com.eventos.event_service.service;

import com.eventos.event_service.dto.EventRequest;
import com.eventos.event_service.dto.EventResponse;
import java.util.List;

/**
 * Contrato del servicio de eventos
 * Principio DIP: el controlador depende de esta interfaz, no de la implementación
 * Principio ISP: solo declara métodos relevantes para eventos
 */
public interface EventService {

    // Registra un nuevo evento
    EventResponse createEvent(EventRequest request);

    // Lista todos los eventos activos
    List<EventResponse> getAllEvents();

    // Obtiene el detalle de un evento por ID
    EventResponse getEventById(Long id);
}