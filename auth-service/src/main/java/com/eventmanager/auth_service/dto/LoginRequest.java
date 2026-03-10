package com.eventmanager.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request para iniciar sesión.
 * Se acepta username o email como identificador.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "El usuario o email es obligatorio")
    private String usernameOrEmail;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
