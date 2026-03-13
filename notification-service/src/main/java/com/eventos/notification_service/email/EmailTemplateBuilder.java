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
                ? frontendUrl + "my-events"
                : frontendUrl + "/my-events";

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Inscripcion confirmada</title>
                </head>
                <body style="margin:0;padding:0;background-color:#F9FAFB;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1F2937;-webkit-font-smoothing:antialiased;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;padding:40px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
                          
                          <!-- Header Section -->
                          <tr>
                            <td style="padding:48px 40px;text-align:center;background:linear-gradient(135deg,#0d9488 0%%,#14b8a6 100%%);">
                              <p style="margin:0 0 16px;font-size:14px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#ccfbf1;">
                                Pura Vida PC
                              </p>
                              <h1 style="margin:0;font-size:32px;font-weight:800;line-height:1.2;color:#ffffff;text-shadow:0 2px 4px rgba(0,0,0,0.1);">
                                ¡Estás dentro! 🎉
                              </h1>
                              <p style="margin:16px auto 0;font-size:16px;line-height:1.5;color:#f0fdfa;max-width:400px;">
                                Tu inscripción se ha procesado exitosamente y tu lugar está reservado en el paraíso de Punta Cana.
                              </p>
                            </td>
                          </tr>

                          <!-- Content Section -->
                          <tr>
                            <td style="padding:40px;">
                              
                              <!-- Event details card -->
                              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background-color:#fff7ed;border-left:4px solid #f97316;border-radius:0 12px 12px 0;">
                                <tr>
                                  <td style="padding:24px;">
                                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#c2410c;">Detalles del Evento</p>
                                    <h2 style="margin:0;font-size:24px;font-weight:700;line-height:1.3;color:#9a3412;">%s</h2>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">
                                %s
                              </p>

                              <!-- Info box -->
                              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background-color:#f0fdfa;border-radius:12px;">
                                <tr>
                                  <td style="padding:20px;display:flex;align-items:flex-start;">
                                    <div style="font-size:24px;margin-right:16px;">💡</div>
                                    <div>
                                      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#0f766e;">
                                        ¿Qué sigue ahora?
                                      </p>
                                      <p style="margin:0;font-size:14px;line-height:1.6;color:#115e59;">
                                        Puedes revisar en cualquier momento los detalles de tus eventos registrados y gestionar tus inscripciones desde tu panel de control.
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </table>

                              <!-- Action Button -->
                              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;text-align:center;">
                                <tr>
                                  <td align="center" style="border-radius:8px;background-color:#f97316;box-shadow:0 4px 6px rgba(249, 115, 22, 0.25);">
                                    <a href="%s" style="display:inline-block;padding:16px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.5px;">
                                      Ver Mis Eventos
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              
                              <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;text-align:center;">
                                Si tienes alguna duda, responde a este correo o contáctanos a soporte@puravidapc.com
                              </p>
                            </td>
                          </tr>

                          <!-- Footer Section -->
                          <tr>
                            <td style="padding:24px 40px;background-color:#f3f4f6;text-align:center;border-top:1px solid #e5e7eb;">
                              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#4b5563;">
                                Pura Vida PC
                              </p>
                              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                                Bávaro, Punta Cana, República Dominicana<br>
                                Este es un mensaje automatizado, por favor no lo marque como spam.
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
