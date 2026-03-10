package com.eventmanager.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Filtro Global de Autenticación.
 * 1. Intercepta todas las peticiones.
 * 2. Si la ruta requiere auth (no es /auth/**), valida el JWT.
 * 3. Extrae claims e inyecta headers X-User-* para los microservicios internos.
 */
@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${app.jwt.secret}")
    private String secret;

    private static final List<String> EXCLUDED_PATHS = List.of("/api/auth/login", "/api/auth/register",
            "/api/auth/health");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Omitir rutas públicas
        if (EXCLUDED_PATHS.stream().anyMatch(path::contains)) {
            return chain.filter(exchange);
        }

        // 2. Verificar existencia del header Authorization
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "Falta el encabezado de autorización", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Formato de token inválido", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            // 3. Validar y extraer claims
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 4. Inyectar datos en el request hacia el microservicio
            // El subject en auth-service es "userId:username"
            String subject = claims.getSubject();
            String userId = subject.split(":")[0];
            String username = claims.get("username", String.class);
            String role = claims.get("role", String.class);

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Name", username)
                    .header("X-User-Role", role)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (Exception e) {
            return onError(exchange, "Token inválido o expirado: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Alta prioridad
    }
}
