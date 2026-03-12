package com.eventos.notification_service.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    private final String frontendUrl;

    public EmailTemplateBuilder(
            @Value("${app.frontend-url:https://frontend-production-5e8b.up.railway.app}") String frontendUrl
    ) {
        this.frontendUrl = frontendUrl;
    }

    public String buildSubject(String eventName) {
        return "Inscripcion confirmada | " + eventName;
    }

    public String buildHtml(String eventName, String message) {
        String safeMessage = message == null || message.isBlank()
                ? "Tu registro fue confirmado correctamente."
                : message;
        String myEventsUrl = frontendUrl.endsWith("/")
                ? frontendUrl + "my-events.html"
                : frontendUrl + "/my-events.html";

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Inscripcion confirmada</title>
                </head>
                <body style="margin:0;padding:0;background:#f4efe4;font-family:Arial,Helvetica,sans-serif;color:#16363c;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f4efe4;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fffdf8;border-radius:24px;overflow:hidden;border:1px solid #e7d9bd;">
                          <tr>
                            <td style="padding:34px 32px;background:linear-gradient(135deg,#124c56 0%%,#4b9da9 55%%,#f0b46a 100%%);color:#ffffff;">
                              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.82;">Pura Vida PC</p>
                              <h1 style="margin:0;font-size:30px;line-height:1.1;">Tu inscripcion fue confirmada</h1>
                              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;max-width:460px;opacity:0.95;">
                                Reserva tu lugar, revisa tus eventos y preparate para vivir la experiencia completa en Punta Cana.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:32px;">
                              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#fff4dc;border:1px solid #f1d3a0;border-radius:18px;">
                                <tr>
                                  <td style="padding:24px;">
                                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#94652b;">Evento</p>
                                    <h2 style="margin:0;font-size:26px;line-height:1.25;color:#d66f28;">%s</h2>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#29454b;">%s</p>

                              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#eef7f6;border-radius:18px;border:1px solid #d6ebe8;">
                                <tr>
                                  <td style="padding:20px 22px;">
                                    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#124c56;">
                                      Desde tu panel puedes revisar el historial de inscripciones y confirmar que el registro quedo guardado.
                                    </p>
                                    <p style="margin:0;font-size:14px;line-height:1.6;color:#4a6469;">
                                      Si no ves el cambio de inmediato, espera unos segundos y vuelve a cargar la pagina.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                                <tr>
                                  <td align="center" style="border-radius:999px;background:#124c56;">
                                    <a href="%s" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                                      Ver Mis Eventos
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7f83;">
                                Este correo fue enviado automaticamente por Pura Vida PC. Si hiciste esta inscripcion por error, ignora este mensaje.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 32px;background:#16363c;color:#d2dfdf;">
                              <p style="margin:0;font-size:12px;line-height:1.6;">
                                Pura Vida PC | Bavaro, Punta Cana, Republica Dominicana
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(eventName, safeMessage, myEventsUrl);
    }
}
