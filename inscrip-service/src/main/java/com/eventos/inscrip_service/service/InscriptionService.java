package com.eventos.inscrip_service.service;

import com.eventos.inscrip_service.dto.InscriptionRequest;
import com.eventos.inscrip_service.dto.InscriptionResponse;
import com.eventos.inscrip_service.entity.Inscription;
import com.eventos.inscrip_service.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Clase InscriptionService
 * Propósito: Clase de la capa de Negocio donde se ejecutan las reglas del sistema.
 * Actúa como intermediario entre el controlador (API) y el repositorio (Base de Datos).
 */
@Service
@RequiredArgsConstructor // Inyecta las dependencias necesarias de forma automática (Constructor Injection).
public class InscriptionService {

    // Repositorio inyectado para interactuar con la persistencia.
    private final InscriptionRepository inscriptionRepository;

    /**
     * Propósito: Registrar una nueva inscripción en el sistema.
     * @param request Datos de entrada (userId, eventId).
     * @return El objeto de respuesta mapeado.
     */
    @Transactional // Garantiza que si algo falla, no se guarde nada parcial en la base de datos (Atomicidad).
    public InscriptionResponse createInscription(InscriptionRequest request) {
        
        // REGLA DE NEGOCIO: Evitar que un usuario se inscriba dos veces al mismo evento.
        if (inscriptionRepository.existsByUserIdAndEventId(request.getUserId(), request.getEventId())) {
            throw new RuntimeException("El usuario ya está inscrito en este evento");
        }

        // Construcción de la Entidad a partir del DTO usando el patrón Builder.
        Inscription inscription = Inscription.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .inscriptionDate(LocalDateTime.now()) // Marca de tiempo actual.
                .status("CONFIRMED") // Por defecto, la inscripción nace confirmada.
                .build();

        // Persistencia de los datos en MySQL.
        Inscription saved = inscriptionRepository.save(inscription);
        
        // Retornamos la respuesta transformada para no exponer directamente la entidad de la DB.
        return mapToResponse(saved);
    }

    /**
     * Propósito: Consultar el historial de actividades de un usuario.
     * @param userId El ID del usuario.
     * @return Lista de inscripciones correspondientes.
     */
    @Transactional(readOnly = true) // Optimiza la consulta al indicar que no habrá cambios en la DB.
    public List<InscriptionResponse> getUserInscriptions(Long userId) {
        return inscriptionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse) // Transformación funcional de Entity -> DTO.
                .collect(Collectors.toList());
    }

    /**
     * Método Privado: mapToResponse
     * Propósito: Convertir una Entidad JPA en un DTO de respuesta.
     * Ayuda a separar el modelo de datos interno de la interfaz pública de la API.
     */
    private InscriptionResponse mapToResponse(Inscription entity) {
        return InscriptionResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .eventId(entity.getEventId())
                .inscriptionDate(entity.getInscriptionDate())
                .status(entity.getStatus())
                .build();
    }
}
