package com.eventos.notification_service.email;

/**
 * Interfaz que define el contrato para enviar correos electrónicos.
 * Permite tener diferentes implementaciones (SMTP, SendGrid, Mailgun, etc.)
 * sin afectar al servicio que la consume.
 *
 * Principio SOLID aplicado:
 * - ISP: interfaz con un solo método específico para enviar confirmaciones.
 * - DIP: el servicio depende de esta abstracción, no de una implementación concreta.
 * - OCP: se pueden agregar nuevas implementaciones sin modificar el código existente.
 */
public interface EmailSender {

    /**
     * Envía un correo de confirmación de inscripción al usuario.
     *
     * @param destinatario correo del usuario
     * @param eventName    nombre del evento
     * @param message      mensaje de confirmación
     */
    void enviarConfirmacion(String destinatario, String eventName, String message);
}