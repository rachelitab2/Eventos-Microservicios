package com.eventmanager.event_service.domain;

/**
 * Estados posibles de un evento:
 * - DRAFT: borrador, solo visible para el organizador
 * - PUBLISHED: publicado, visible y aceptando inscripciones
 * - FULL: capacidad completa, no acepta más inscripciones
 * - CANCELLED: cancelado por el organizador
 * - FINISHED: el evento ya ocurrió
 */
public enum EventStatus {
    DRAFT,
    PUBLISHED,
    FULL,
    CANCELLED,
    FINISHED
}
