package com.eventmanager.auth_service.service;

import com.eventmanager.auth_service.domain.User;
import com.eventmanager.auth_service.domain.UserRole;
import com.eventmanager.auth_service.dto.AuthResponse;
import com.eventmanager.auth_service.dto.LoginRequest;
import com.eventmanager.auth_service.dto.RegisterRequest;
import com.eventmanager.auth_service.exception.AuthException;
import com.eventmanager.auth_service.repository.UserRepository;
import com.eventmanager.auth_service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Servicio de autenticación.
 * Maneja registro de usuarios y login con BCrypt + JWT real.
 *
 * MEJORA vs proyecto original:
 * - BCryptPasswordEncoder real (no texto plano)
 * - JWT real para todos los usuarios
 * - Validación de duplicados en usuario y email
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * @param request datos del nuevo usuario
     * @return AuthResponse con el token JWT generado
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Verificar que el username no exista
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("El nombre de usuario '" + request.getUsername() + "' ya está registrado.");
        }

        // Verificar que el email no exista
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("El email '" + request.getEmail() + "' ya está registrado.");
        }

        // Determinar rol (por defecto USER)
        UserRole role = UserRole.USER;
        if (request.getRole() != null) {
            try {
                role = UserRole.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Si el rol no es válido, se usa USER
            }
        }

        // Crear el usuario con contraseña cifrada
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt
                .fullName(request.getFullName())
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);

        // Generar JWT
        String token = generateToken(user);

        return buildAuthResponse(user, token);
    }

    /**
     * Autentica un usuario existente.
     * Acepta username o email como identificador.
     *
     * @param request credenciales del usuario
     * @return AuthResponse con el token JWT
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Buscar por username o email
        User user = userRepository.findByUsernameAndActiveTrue(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmailAndActiveTrue(request.getUsernameOrEmail()))
                .orElseThrow(() -> new AuthException("Credenciales incorrectas."));

        // Verificar contraseña con BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Credenciales incorrectas.");
        }

        String token = generateToken(user);
        return buildAuthResponse(user, token);
    }

    // ======================== PRIVADOS ========================

    private String generateToken(User user) {
        return jwtTokenProvider.generateToken(
                user.getId() + ":" + user.getUsername(),
                Map.of(
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresAt(jwtTokenProvider.getExpirationInstant())
                .build();
    }
}
