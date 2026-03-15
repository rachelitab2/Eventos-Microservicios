package com.eventos.auth_service.controller;

import com.eventos.auth_service.dto.AuthResponse;
import com.eventos.auth_service.dto.LoginRequest;
import com.eventos.auth_service.dto.RegisterRequest;
import com.eventos.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:8080", "https://frontend-production-5e8b.up.railway.app"}, allowCredentials = "false")
// Este controller expone los endpoints de autenticacion.
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    // Endpoint para registrar un usuario nuevo.
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    // Endpoint para iniciar sesion.
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register-admin")
    // Endpoint para registrar un usuario administrador con clave secreta.
    public ResponseEntity<AuthResponse> registerAdmin(
            @Valid @RequestBody RegisterRequest request,
            @RequestHeader("X-Admin-Secret") String adminSecret) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerAdmin(request, adminSecret));
    }
}
