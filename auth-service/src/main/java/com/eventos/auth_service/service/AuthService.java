package com.eventos.auth_service.service;

import com.eventos.auth_service.dto.AuthResponse;
import com.eventos.auth_service.dto.LoginRequest;
import com.eventos.auth_service.dto.RegisterRequest;
import com.eventos.auth_service.entity.User;
import com.eventos.auth_service.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
// Aqui va la logica principal del registro y del inicio de sesion.
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Este metodo registra el usuario y evita que se repita email o username.
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        return new AuthResponse("User registered successfully", savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());
    }

    // Este metodo valida las credenciales y permite iniciar sesion si todo esta correcto.
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new AuthResponse("Login successful", user.getId(), user.getUsername(), user.getEmail());
    }
}
