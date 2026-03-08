package com.eventos.inscrip_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO InscriptionResponse (Output)
 * Propósito: Objeto que se envía al cliente tras completar la operación.
 * Protege la entidad original, enviando solo lo necesario y permitiendo formatos limpios.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionResponse {
    private Long id; // ID generado de la inscripción.
    private Long userId; // ID del usuario asociado.
    private Long eventId; // ID del evento asociado.
    private LocalDateTime inscriptionDate; // Fecha de creación procesada.
    private String status; // Estatus final de la operación.
}
