package com.eventos.notification_service.email;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "smtp")
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromName;
    private final EmailTemplateBuilder templateBuilder;
    private final String resendApiKey;
    private final String resendFromEmail;
    private final String resendFromName;
    private final RestTemplate restTemplate;

    public SmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.mail.from-email}") String fromEmail,
            @Value("${app.mail.from-name:Pura Vida PC}") String fromName,
            @Value("${resend.api-key:}") String resendApiKey,
            @Value("${resend.from-email:onboarding@resend.dev}") String resendFromEmail,
            @Value("${resend.from-name:Pura Vida PC}") String resendFromName,
            EmailTemplateBuilder templateBuilder
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.templateBuilder = templateBuilder;
        this.resendApiKey = resendApiKey;
        this.resendFromEmail = resendFromEmail;
        this.resendFromName = resendFromName;
        this.restTemplate = new RestTemplate();
        log.info("Proveedor de correo activo: smtp. From: {} <{}>", fromName, fromEmail);
    }

    @Override
    public void enviarConfirmacion(String destinatario, String eventName, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(destinatario);
            helper.setSubject(templateBuilder.buildSubject(eventName));
            helper.setText(templateBuilder.buildHtml(eventName, message), true);
            mailSender.send(mimeMessage);
            log.info("Correo enviado via SMTP a {}", destinatario);
        } catch (Exception e) {
            log.error("Fallo enviando correo via SMTP a {}. Se intentara fallback HTTPS si esta disponible.", destinatario, e);
            enviarViaResendSiExiste(destinatario, eventName, message);
        }
    }

    private void enviarViaResendSiExiste(String destinatario, String eventName, String message) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("Fallback Resend omitido para {} porque RESEND_API_KEY no esta configurada", destinatario);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                    "from", resendFromName + " <" + resendFromEmail + ">",
                    "to", List.of(destinatario),
                    "subject", templateBuilder.buildSubject(eventName),
                    "html", templateBuilder.buildHtml(eventName, message)
            );

            restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    new HttpEntity<>(body, headers),
                    String.class
            );
            log.info("Correo enviado via Resend fallback a {}", destinatario);
        } catch (Exception fallbackError) {
            log.error("Tambien fallo el fallback via Resend para {}", destinatario, fallbackError);
        }
    }
}
