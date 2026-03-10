package com.eventmanager.event_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request para inscribirse a un evento.
 */
@Data
public class RegistrationRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String userName;

    @NotBlank(message = "El email es obligatorio")
    private String userEmail;
}
