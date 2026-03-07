package com.eventos.user_service.controller;

import com.eventos.user_service.dto.UserProfileRequest;
import com.eventos.user_service.dto.UserProfileResponse;
import com.eventos.user_service.service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// S - Single Responsibility: esta clase solo maneja las peticiones HTTP
// D - Dependency Inversion: depende del servicio, no del repositorio directamente
@RestController
@RequestMapping("/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    // Inyección por constructor
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    // POST /users → crear perfil
    @PostMapping
    public ResponseEntity<UserProfileResponse> crearPerfil(@RequestBody UserProfileRequest request) {
        UserProfileResponse response = userProfileService.crearPerfil(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /users/{id} → consultar perfil por id interno
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> obtenerPorId(@PathVariable Long id) {
        UserProfileResponse response = userProfileService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    // GET /users/auth/{authUserId} → consultar perfil por id de auth-service
    @GetMapping("/auth/{authUserId}")
    public ResponseEntity<UserProfileResponse> obtenerPorAuthUserId(@PathVariable Long authUserId) {
        UserProfileResponse response = userProfileService.obtenerPorAuthUserId(authUserId);
        return ResponseEntity.ok(response);
    }

    // PUT /users/{id} → actualizar perfil
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> actualizarPerfil(
            @PathVariable Long id,
            @RequestBody UserProfileRequest request) {
        UserProfileResponse response = userProfileService.actualizarPerfil(id, request);
        return ResponseEntity.ok(response);
    }
}