package com.eventos.notification_service.email;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "smtp")
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromName;
    private final EmailTemplateBuilder templateBuilder;

    public SmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.mail.from-email}") String fromEmail,
            @Value("${app.mail.from-name:Pura Vida PC}") String fromName,
            EmailTemplateBuilder templateBuilder
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.templateBuilder = templateBuilder;
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
            log.error("Fallo enviando correo via SMTP a {}", destinatario, e);
        }
    }
}
