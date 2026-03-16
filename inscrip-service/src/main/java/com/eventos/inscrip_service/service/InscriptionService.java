package com.eventos.inscrip_service.service;

import com.eventos.inscrip_service.dto.InscriptionRequest;
import com.eventos.inscrip_service.dto.InscriptionResponse;
import com.eventos.inscrip_service.entity.Inscription;
import com.eventos.inscrip_service.exception.InscriptionException;
import com.eventos.inscrip_service.mapper.InscriptionMapper;
import com.eventos.inscrip_service.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Clase InscriptionService
 * Propósito: Clase de la capa de Negocio donde se ejecutan las reglas del sistema.
 */
@Service
@RequiredArgsConstructor
public class InscriptionService {

    private static final String CANCELLED_STATUS = "CANCELLED";

    private final InscriptionRepository inscriptionRepository;
    private final InscriptionMapper inscriptionMapper;

    /**
     * Registrar una nueva inscripción.
     */
    @Transactional
    public InscriptionResponse createInscription(InscriptionRequest request) {
        
        if (inscriptionRepository.existsByUserIdAndEventIdAndStatusNot(request.getUserId(), request.getEventId(), CANCELLED_STATUS)) {
            throw new InscriptionException("El usuario ya está inscrito en este evento");
        }

        Inscription inscription = inscriptionMapper.toEntity(request);
        Inscription saved = inscriptionRepository.save(inscription);
        
        return inscriptionMapper.toResponse(saved);
    }

    /**
     * Consultar historial de usuario.
     */
    @Transactional(readOnly = true)
    public List<InscriptionResponse> getUserInscriptions(Long userId) {
        return inscriptionRepository.findByUserIdAndStatusNot(userId, CANCELLED_STATUS).stream()
                .map(inscriptionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Eliminar una inscripcion por su ID.
     */
    @Transactional
    public void deleteInscription(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new InscriptionException("La inscripcion no existe"));

        if (CANCELLED_STATUS.equalsIgnoreCase(inscription.getStatus())) {
            return;
        }

        if (inscription.getId() == null) {
            throw new InscriptionException("La inscripcion no existe");
        }

        inscription.setStatus(CANCELLED_STATUS);
        inscriptionRepository.save(inscription);
    }

    /**
     * Contar cuantas inscripciones existen en un evento.
     */
    @Transactional(readOnly = true)
    public long countByEvent(Long eventId) {
        return inscriptionRepository.countByEventIdAndStatusNot(eventId, CANCELLED_STATUS);
    }

    /**
     * Obtener todas las inscripciones de un evento.
     */
    @Transactional(readOnly = true)
    public List<InscriptionResponse> getEventInscriptions(Long eventId) {
        return inscriptionRepository.findByEventIdAndStatusNot(eventId, CANCELLED_STATUS).stream()
                .map(inscriptionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Verificar si un usuario ya esta inscrito en un evento.
     */
    @Transactional(readOnly = true)
    public boolean isUserInscribed(Long userId, Long eventId) {
        return inscriptionRepository.existsByUserIdAndEventIdAndStatusNot(userId, eventId, CANCELLED_STATUS);
    }
}
