package com.eventos.user_service.service;

import com.eventos.user_service.dto.UserProfileRequest;
import com.eventos.user_service.dto.UserProfileResponse;
import com.eventos.user_service.entity.UserProfile;
import com.eventos.user_service.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

//import java.util.Optional;

// S - Single Responsibility: esta clase solo maneja la lógica de negocio del perfil
// D - Dependency Inversion: depende del repositorio por inyección, no lo instancia directamente
@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    // Inyección de dependencia por constructor (buena práctica SOLID)
    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    // Crear perfil nuevo
    public UserProfileResponse crearPerfil(UserProfileRequest request) {
        UserProfile perfil = new UserProfile();
        perfil.setAuthUserId(request.getAuthUserId());
        perfil.setNombre(request.getNombre());
        perfil.setApellido(request.getApellido());
        perfil.setTelefono(request.getTelefono());
        perfil.setDireccion(request.getDireccion());
        perfil.setGenero(request.getGenero());
        perfil.setFechaNacimiento(request.getFechaNacimiento());
        perfil.setFotoPerfil(request.getFotoPerfil());

        UserProfile guardado = userProfileRepository.save(perfil);
        return convertirAResponse(guardado);
    }

    // Consultar perfil por id interno
    public UserProfileResponse obtenerPorId(Long id) {
        UserProfile perfil = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado con id: " + id));
        return convertirAResponse(perfil);
    }

    // Consultar perfil por authUserId (id que viene de auth-service)
    public UserProfileResponse obtenerPorAuthUserId(Long authUserId) {
        UserProfile perfil = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado para el usuario: " + authUserId));
        return convertirAResponse(perfil);
    }

    // Actualizar perfil existente
    public UserProfileResponse actualizarPerfil(Long id, UserProfileRequest request) {
        UserProfile perfil = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado con id: " + id));

        perfil.setNombre(request.getNombre());
        perfil.setApellido(request.getApellido());
        perfil.setTelefono(request.getTelefono());
        perfil.setDireccion(request.getDireccion());
        perfil.setGenero(request.getGenero());
        perfil.setFechaNacimiento(request.getFechaNacimiento());
        perfil.setFotoPerfil(request.getFotoPerfil());

        UserProfile actualizado = userProfileRepository.save(perfil);
        return convertirAResponse(actualizado);
    }

    // O - Open/Closed: si mañana cambian los campos del response, solo tocamos este método
    // Convierte entidad a DTO de respuesta
    private UserProfileResponse convertirAResponse(UserProfile perfil) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(perfil.getId());
        response.setAuthUserId(perfil.getAuthUserId());
        response.setNombre(perfil.getNombre());
        response.setApellido(perfil.getApellido());
        response.setTelefono(perfil.getTelefono());
        response.setDireccion(perfil.getDireccion());
        response.setGenero(perfil.getGenero());
        response.setFechaNacimiento(perfil.getFechaNacimiento());
        response.setFotoPerfil(perfil.getFotoPerfil());
        response.setFechaCreacion(perfil.getFechaCreacion());
        response.setFechaActualizacion(perfil.getFechaActualizacion());
        return response;
    }
}