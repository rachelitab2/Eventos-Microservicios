package com.eventmanager.event_service.dto;

import com.eventmanager.event_service.domain.EventCategory;
import com.eventmanager.event_service.domain.EventStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Respuesta con la información completa de un evento.
 */
@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private EventCategory category;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private Integer capacity;
    private long registeredCount;
    private int availableSpots;
    private EventStatus status;
    private Long organizerId;
    private String organizerName;
    private LocalDateTime createdAt;
}
