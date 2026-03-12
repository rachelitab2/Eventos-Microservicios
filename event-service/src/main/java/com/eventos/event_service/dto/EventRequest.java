package com.eventos.event_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventRequest {

    @NotBlank(message = "El nombre del evento es obligatorio")
    private String name;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotBlank(message = "La ubicación es obligatoria")
    private String location;

    @NotNull(message = "La fecha del evento es obligatoria")
    @Future(message = "La fecha del evento debe ser en el futuro, no puede ser una fecha pasada")
    private LocalDateTime eventDate;

    @NotNull(message = "La capacidad total es obligatoria")
    @Min(value = 1, message = "La capacidad mínima es 1 persona")
    private Integer totalCapacity;

    @NotBlank(message = "La categoría es obligatoria")
    private String category;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    private Double price;

    private String imageUrl;
    private String instagramUrl;
    private String instagramUser;
    private String facebookUrl;
    private String facebookUser;
    private String whatsappNumber;
    private String tiktokUrl;
    private String tiktokUser;
}