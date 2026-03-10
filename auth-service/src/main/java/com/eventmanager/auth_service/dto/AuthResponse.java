package com.eventmanager.auth_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

/**
 * Respuesta con el token JWT tras una autenticación exitosa.
 */
@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Instant expiresAt;
}
