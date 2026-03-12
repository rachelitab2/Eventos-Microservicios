package com.eventos.notification_service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "none", matchIfMissing = true)
public class NoOpEmailSender implements EmailSender {

    @Override
    public void enviarConfirmacion(String destinatario, String eventName, String message) {
        log.warn(
                "No hay proveedor de correo configurado. Se omite el envio a {} para el evento {}",
                destinatario,
                eventName
        );
    }
}
