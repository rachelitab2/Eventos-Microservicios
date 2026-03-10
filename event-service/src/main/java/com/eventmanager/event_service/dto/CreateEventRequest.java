package com.eventmanager.event_service.dto;

import com.eventmanager.event_service.domain.EventCategory;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Request para crear un nuevo evento.
 * Solo ORGANIZER y ADMIN pueden usar este endpoint.
 */
@Data
public class CreateEventRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede superar 200 caracteres")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotNull(message = "La categoría es obligatoria")
    private EventCategory category;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Future(message = "La fecha de inicio debe ser futura")
    private LocalDateTime startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDateTime endDate;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 300, message = "La ubicación no puede superar 300 caracteres")
    private String location;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser al menos 1")
    @Max(value = 100000, message = "La capacidad no puede superar 100,000")
    private Integer capacity;
}
