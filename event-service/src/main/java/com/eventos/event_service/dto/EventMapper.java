package com.eventos.event_service.dto;

import com.eventos.event_service.entity.Event;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class EventMapper {

    // Convierte EventRequest → Entity (para guardar en BD)
    public Event toEntity(EventRequest request) {
        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setTotalCapacity(request.getTotalCapacity());
        event.setAvailableSpots(request.getTotalCapacity());
        event.setCategory(request.getCategory());
        event.setPrice(request.getPrice());
        event.setImageUrl(request.getImageUrl());
        // Redes sociales opcionales
        event.setInstagramUrl(request.getInstagramUrl());
        event.setInstagramUser(request.getInstagramUser());
        event.setFacebookUrl(request.getFacebookUrl());
        event.setFacebookUser(request.getFacebookUser());
        event.setWhatsappNumber(request.getWhatsappNumber());
        event.setTiktokUrl(request.getTiktokUrl());
        event.setTiktokUser(request.getTiktokUser());
        return event;
    }

    // Convierte Entity → EventResponse (para devolver al cliente)
    public EventResponse toResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setName(event.getName());
        response.setDescription(event.getDescription());
        response.setLocation(event.getLocation());
        response.setEventDate(event.getEventDate());
        response.setTotalCapacity(event.getTotalCapacity());
        response.setAvailableSpots(event.getAvailableSpots());
        response.setCategory(event.getCategory());
        response.setPrice(event.getPrice());
        response.setActive(event.isActive());
        response.setCreatedAt(event.getCreatedAt());
        response.setStatus(resolveStatus(event));
        response.setImageUrl(event.getImageUrl());
        // Redes sociales opcionales
        response.setInstagramUrl(event.getInstagramUrl());
        response.setInstagramUser(event.getInstagramUser());
        response.setFacebookUrl(event.getFacebookUrl());
        response.setFacebookUser(event.getFacebookUser());
        response.setWhatsappNumber(event.getWhatsappNumber());
        response.setTiktokUrl(event.getTiktokUrl());
        response.setTiktokUser(event.getTiktokUser());
        return response;
    }

    // Calcula el estado del evento automáticamente
    private String resolveStatus(Event event) {
        if (!event.isActive()) return "INACTIVO";
        if (event.getAvailableSpots() == 0) return "AGOTADO";
        if (event.getEventDate().isAfter(LocalDateTime.now().plusDays(30))) return "PRÓXIMO";
        return "DISPONIBLE";
    }
}