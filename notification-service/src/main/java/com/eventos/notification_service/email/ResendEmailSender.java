package com.eventos.notification_service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "resend")
public class ResendEmailSender implements EmailSender {

    private final String apiKey;
    private final boolean enabled;
    private final String fromEmail;
    private final String fromName;
    private final EmailTemplateBuilder templateBuilder;
    private final RestTemplate restTemplate;

    public ResendEmailSender(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:onboarding@resend.dev}") String fromEmail,
            @Value("${resend.from-name:Pura Vida PC}") String fromName,
            EmailTemplateBuilder templateBuilder
    ) {
        this.apiKey = apiKey;
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.templateBuilder = templateBuilder;
        this.restTemplate = new RestTemplate();

        if (this.enabled) {
            log.info("Proveedor de correo activo: resend. From: {} <{}>", fromName, fromEmail);
        } else {
            log.warn("MAIL_PROVIDER=resend pero falta RESEND_API_KEY. El correo no se enviara.");
        }
    }

    @Override
    public void enviarConfirmacion(String destinatario, String eventName, String message) {
        if (!enabled) {
            log.warn("Envio omitido para {} porque Resend no esta configurado", destinatario);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            String sender = fromName + " <" + fromEmail + ">";
            
            // Resend API body mapping
            Map<String, Object> body = Map.of(
                    "from", sender,
                    "to", List.of(destinatario),
                    "subject", templateBuilder.buildSubject(eventName),
                    "html", templateBuilder.buildHtml(eventName, message)
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Correo enviado via Resend a {}. Status={}", destinatario, response.getStatusCode());
            } else {
                log.error("Error enviando correo via Resend a {}. Status={}, body={}",
                        destinatario, response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Fallo inesperado enviando correo via Resend a {}", destinatario, e);
        }
    }
}
