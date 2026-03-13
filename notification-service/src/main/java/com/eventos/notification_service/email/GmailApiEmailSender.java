package com.eventos.notification_service.email;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "gmail-api")
public class GmailApiEmailSender implements EmailSender {

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;
    private final String fromEmail;
    private final String fromName;
    private final EmailTemplateBuilder templateBuilder;
    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;

    public GmailApiEmailSender(
            @Value("${gmail.client-id}") String clientId,
            @Value("${gmail.client-secret}") String clientSecret,
            @Value("${gmail.refresh-token}") String refreshToken,
            @Value("${app.mail.from-email}") String fromEmail,
            @Value("${app.mail.from-name:Pura Vida PC}") String fromName,
            EmailTemplateBuilder templateBuilder,
            JavaMailSender mailSender
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.templateBuilder = templateBuilder;
        this.mailSender = mailSender;
        this.restTemplate = new RestTemplate();
        log.info("Proveedor de correo activo: gmail-api. From: {} <{}>", fromName, fromEmail);
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("refresh_token", refreshToken);
        map.add("grant_type", "refresh_token");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token", request, Map.class);

        if (response.getBody() != null && response.getBody().containsKey("access_token")) {
            return response.getBody().get("access_token").toString();
        }
        throw new RuntimeException("No se pudo obtener el Access Token de Gmail API");
    }

    @Override
    public void enviarConfirmacion(String destinatario, String eventName, String message) {
        try {
            // 1. Obtener Token
            String accessToken = getAccessToken();

            // 2. Construir el RFC 2822 Message
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(destinatario);
            helper.setSubject(templateBuilder.buildSubject(eventName));
            helper.setText(templateBuilder.buildHtml(eventName, message), true);

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            mimeMessage.writeTo(buffer);
            String rawMsg = Base64.getUrlEncoder().encodeToString(buffer.toByteArray());

            // 3. Enviar por API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            Map<String, String> body = Map.of("raw", rawMsg);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(
                    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                    request, String.class);

            log.info("Correo enviado exitosamente via Gmail API (OAuth2) a {}", destinatario);
        } catch (Exception e) {
            log.error("Fallo enviando correo via Gmail API a {}", destinatario, e);
        }
    }
}
