package com.eventmanager.auth_service.controller;

import com.eventmanager.auth_service.dto.AuthResponse;
import com.eventmanager.auth_service.dto.LoginRequest;
import com.eventmanager.auth_service.dto.RegisterRequest;
import com.eventmanager.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación.
 * Rutas públicas: no requieren JWT.
 *
 * Base path: /auth (configurado en el Gateway como /api/auth)
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registrar un nuevo usuario.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    /**
     * Iniciar sesión (username o email + contraseña).
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Health check del servicio de auth.
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("auth-service is running");
    }
}
