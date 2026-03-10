package com.eventmanager.auth_service.domain;

/**
 * Roles del sistema de gestión de eventos:
 * - USER: usuario normal que puede inscribirse a eventos
 * - ORGANIZER: puede crear y gestionar sus propios eventos
 * - ADMIN: acceso total al sistema
 */
public enum UserRole {
    USER,
    ORGANIZER,
    ADMIN
}
