package com.eventos.inscrip_service.mapper;

import com.eventos.inscrip_service.dto.InscriptionRequest;
import com.eventos.inscrip_service.dto.InscriptionResponse;
import com.eventos.inscrip_service.entity.Inscription;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper para centralizar la conversión entre DTOs y Entidades.
 * Ayuda a cumplir el principio SRP (Single Responsibility Principle).
 */
@Component
public class InscriptionMapper {

    /**
     * Convierte el DTO de entrada a la Entidad JPA.
     */
    public Inscription toEntity(InscriptionRequest request) {
        return Inscription.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .inscriptionDate(LocalDateTime.now())
                .status("CONFIRMED")
                .build();
    }

    /**
     * Convierte la Entidad JPA al DTO de respuesta.
     */
    public InscriptionResponse toResponse(Inscription entity) {
        return InscriptionResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .eventId(entity.getEventId())
                .inscriptionDate(entity.getInscriptionDate())
                .status(entity.getStatus())
                .build();
    }
}
