package com.eventos.event_service.exception;

/**
 * Se lanza cuando no se encuentra un evento por su ID
 */
public class EventNotFoundException extends RuntimeException {

    public EventNotFoundException(Long id) {
        super("No se encontró el evento con ID: " + id);
    }
}