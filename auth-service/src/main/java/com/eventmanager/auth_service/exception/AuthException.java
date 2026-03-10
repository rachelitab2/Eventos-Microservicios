package com.eventmanager.auth_service.exception;

/**
 * Excepción de dominio para errores de autenticación.
 * Se mapea a HTTP 401 Unauthorized en el GlobalExceptionHandler.
 */
public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
