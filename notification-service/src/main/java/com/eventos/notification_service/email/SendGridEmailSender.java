package com.eventos.notification_service.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "sendgrid")
public class SendGridEmailSender implements EmailSender {

    private final SendGrid sendGrid;
    private final boolean enabled;
    private final String fromEmail;
    private final String fromName;
    private final EmailTemplateBuilder templateBuilder;

    public SendGridEmailSender(
            @Value("${sendgrid.api-key:}") String apiKey,
            @Value("${sendgrid.from-email}") String fromEmail,
            @Value("${sendgrid.from-name:Pura Vida PC}") String fromName,
            EmailTemplateBuilder templateBuilder
    ) {
        this.sendGrid = new SendGrid(apiKey);
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.templateBuilder = templateBuilder;

        if (this.enabled) {
            log.info("Proveedor de correo activo: sendgrid. From: {} <{}>", fromName, fromEmail);
        } else {
            log.warn("MAIL_PROVIDER=sendgrid pero falta SENDGRID_API_KEY. El correo no se enviara.");
        }
    }

    @Override
    public void enviarConfirmacion(String destinatario, String eventName, String message) {
        if (!enabled) {
            log.warn("Envio omitido para {} porque SendGrid no esta configurado", destinatario);
            return;
        }

        try {
            Mail mail = new Mail(
                    new Email(fromEmail, fromName),
                    templateBuilder.buildSubject(eventName),
                    new Email(destinatario),
                    new Content("text/html", templateBuilder.buildHtml(eventName, message))
            );

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Correo enviado via SendGrid a {}. Status={}", destinatario, response.getStatusCode());
                return;
            }

            log.error(
                    "Error enviando correo via SendGrid a {}. Status={}, body={}",
                    destinatario,
                    response.getStatusCode(),
                    response.getBody()
            );
        } catch (IOException e) {
            log.error("Fallo de IO enviando correo via SendGrid a {}", destinatario, e);
        } catch (Exception e) {
            log.error("Fallo inesperado enviando correo via SendGrid a {}", destinatario, e);
        }
    }
}
