package com.eventmanager.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

/**
 * Proveedor de tokens JWT.
 * Genera y valida tokens con HMAC-SHA256.
 * El secret y la expiración vienen de application.properties.
 */
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-in-minutes:60}")
    private long expirationInMinutes;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Genera un token JWT firmado con las claims indicadas.
     *
     * @param subject     usualmente "userId:username"
     * @param extraClaims claims adicionales (role, email, etc.)
     * @return token JWT compacto
     */
    public String generateToken(String subject, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        Instant exp = now.plus(expirationInMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(subject)
                .claims(extraClaims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    /**
     * Extrae todas las claims de un token válido.
     *
     * @throws JwtException si el token es inválido o expiró
     */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Valida que el token no esté expirado y sea auténtico.
     */
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Instant getExpirationInstant() {
        return Instant.now().plus(expirationInMinutes, ChronoUnit.MINUTES);
    }
}
