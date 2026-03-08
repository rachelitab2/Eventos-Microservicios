package com.eventos.inscrip_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO InscriptionRequest (Input)
 * Propósito: Objeto de Transferencia de Datos que recibe la información del cliente.
 * Su único fin es capturar userId y eventId de forma segura y validarlos antes de procesar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InscriptionRequest {
    
    // Propósito: ID del usuario obtenido del frontend o del micro de usuarios.
    @NotNull(message = "El ID de usuario es obligatorio")
    private Long userId;
    
    // Propósito: ID del evento al que se desea inscribir.
    @NotNull(message = "El ID de evento es obligatorio")
    private Long eventId;
}
