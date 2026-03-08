package com.eventos.inscrip_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción personalizada para errores de negocio en inscripciones.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InscriptionException extends RuntimeException {
    public InscriptionException(String message) {
        super(message);
    }
}
