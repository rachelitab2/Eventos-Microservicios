package com.eventmanager.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de Spring Security para auth-service.
 *
 * DIFERENCIA vs proyecto original:
 * - CSRF desactivado (API REST stateless)
 * - Sesiones STATELESS (usamos JWT, no sesiones de servidor)
 * - Solo /auth/** es público. Todo lo demás requiere autenticación.
 * - BCryptPasswordEncoder configurado y USADO.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // API REST: sin CSRF ni sesiones
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Rutas: /auth/** son públicas, todo lo demás requiere auth
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/actuator/**").permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }

    /**
     * BCryptPasswordEncoder para cifrar y verificar contraseñas.
     * Strength 12 = buen balance entre seguridad y velocidad.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
