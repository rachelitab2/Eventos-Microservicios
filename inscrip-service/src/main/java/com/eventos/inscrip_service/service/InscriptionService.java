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

    private final InscriptionRepository inscriptionRepository;
    private final InscriptionMapper inscriptionMapper;

    /**
     * Registrar una nueva inscripción.
     */
    @Transactional
    public InscriptionResponse createInscription(InscriptionRequest request) {
        
        if (inscriptionRepository.existsByUserIdAndEventId(request.getUserId(), request.getEventId())) {
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
        return inscriptionRepository.findByUserId(userId).stream()
                .map(inscriptionMapper::toResponse)
                .collect(Collectors.toList());
    }
}
