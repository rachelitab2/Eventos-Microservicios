package com.eventos.notification_service.email;

import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    public String buildSubject(String eventName) {
        return "Inscripcion confirmada - " + eventName;
    }

    public String buildHtml(String eventName, String message) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Helvetica Neue', Arial, sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8; padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                          <tr>
                            <td style="background: linear-gradient(135deg, #4B9DA9 0%%, #91C6BC 100%%); padding:40px 40px 30px; text-align:center;">
                              <div style="display:inline-block; background:rgba(255,255,255,0.15); border-radius:50%%; width:70px; height:70px; line-height:70px; font-size:36px; margin-bottom:16px;">&#127802;</div>
                              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:1px;">Pura Vida PC</h1>
                              <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:13px; letter-spacing:4px; text-transform:uppercase;">Punta Cana</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:40px;">
                              <h2 style="margin:0 0 8px; color:#4B9DA9; font-size:22px;">Tu cupo esta confirmado</h2>
                              <p style="margin:0 0 24px; color:#666; font-size:15px; line-height:1.6;">%s</p>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F6F3C2; border-radius:12px; margin-bottom:24px;">
                                <tr>
                                  <td style="padding:24px;">
                                    <p style="margin:0 0 6px; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px;">Evento confirmado</p>
                                    <h3 style="margin:0; color:#E37434; font-size:20px; font-weight:700;">&#127881; %s</h3>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:0 0 8px; color:#555; font-size:14px; line-height:1.7;">
                                Estamos emocionados de tenerte con nosotros. Guarda este correo como comprobante de tu inscripcion.
                              </p>
                              <p style="margin:0; color:#555; font-size:14px; line-height:1.7;">
                                Nos vemos en Punta Cana.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background:#4B9DA9; padding:24px 40px; text-align:center;">
                              <p style="margin:0; color:rgba(255,255,255,0.8); font-size:12px;">
                                &copy; 2026 Pura Vida PC · Bavaro, Punta Cana, Republica Dominicana
                              </p>
                              <p style="margin:6px 0 0; color:rgba(255,255,255,0.6); font-size:11px;">
                                Este correo fue enviado automaticamente, por favor no respondas a este mensaje.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(message, eventName);
    }
}
