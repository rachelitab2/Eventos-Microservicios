package com.eventos.api_gateway.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/admin/api")
public class AdminController {

    // Tracks which services are "disabled" by admin for testing
    private final Set<String> disabledServices = ConcurrentHashMap.newKeySet();

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${AUTH_SERVICE_URL:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${USER_SERVICE_URL:http://localhost:8082}")
    private String userServiceUrl;

    @Value("${EVENT_SERVICE_URL:http://localhost:8083}")
    private String eventServiceUrl;

    @Value("${INSCRIP_SERVICE_URL:http://localhost:8084}")
    private String inscripServiceUrl;

    @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8085}")
    private String notificationServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final List<Map<String, Object>> auditLog = new CopyOnWriteArrayList<>();

    private record ServiceInfo(String key, String name, String url, int port) {}

    private List<ServiceInfo> getServices() {
        return List.of(
            new ServiceInfo("auth-service", "Auth Service", authServiceUrl, 8081),
            new ServiceInfo("user-service", "User Service", userServiceUrl, 8082),
            new ServiceInfo("event-service", "Event Service", eventServiceUrl, 8083),
            new ServiceInfo("inscrip-service", "Inscription Service", inscripServiceUrl, 8084),
            new ServiceInfo("notification-service", "Notification Service", notificationServiceUrl, 8085)
        );
    }

    private void requireAdmin(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new SecurityException("Token requerido");
        }
        try {
            String token = header.substring(7);
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody();
            String role = claims.get("role", String.class);
            if (!"ADMIN".equals(role)) {
                throw new SecurityException("Se requiere rol ADMIN");
            }
        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            throw new SecurityException("Token inválido o expirado");
        }
    }

    private void audit(String service, String method, String path, int status, String summary) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("timestamp", LocalDateTime.now(ZoneOffset.UTC).toString());
        entry.put("serviceKey", service);
        entry.put("method", method);
        entry.put("path", path);
        entry.put("status", status);
        entry.put("summary", summary);
        auditLog.add(0, entry);
        if (auditLog.size() > 500) {
            auditLog.remove(auditLog.size() - 1);
        }
    }

    private Map<String, Object> checkHealth(ServiceInfo svc) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("key", svc.key());
        result.put("name", svc.name());
        result.put("url", svc.url());
        result.put("port", svc.port());
        result.put("disabled", disabledServices.contains(svc.key()));

        long start = System.currentTimeMillis();
        try {
            ResponseEntity<String> resp = restTemplate.getForEntity(svc.url() + "/health", String.class);
            long latency = System.currentTimeMillis() - start;
            result.put("status", disabledServices.contains(svc.key()) ? "down" : (resp.getStatusCode().is2xxSuccessful() ? "healthy" : "degraded"));
            result.put("latency", latency);
            result.put("httpStatus", resp.getStatusCode().value());
            result.put("lastChecked", Instant.now().toString());
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            result.put("status", "down");
            result.put("latency", latency);
            result.put("httpStatus", 0);
            result.put("error", e.getMessage());
            result.put("lastChecked", Instant.now().toString());
        }
        return result;
    }

    // GET /admin/api/summary
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(HttpServletRequest request) {
        requireAdmin(request);

        List<Map<String, Object>> statuses = getServices().stream().map(this::checkHealth).toList();
        long healthy = statuses.stream().filter(s -> "healthy".equals(s.get("status"))).count();
        long degraded = statuses.stream().filter(s -> "degraded".equals(s.get("status"))).count();
        long down = statuses.stream().filter(s -> "down".equals(s.get("status"))).count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalServices", statuses.size());
        summary.put("healthy", healthy);
        summary.put("degraded", degraded);
        summary.put("down", down);
        summary.put("services", statuses);

        audit("gateway", "GET", "/admin/api/summary", 200, "Dashboard summary requested");
        return ResponseEntity.ok(summary);
    }

    // GET /admin/api/services
    @GetMapping("/services")
    public ResponseEntity<?> getServices(HttpServletRequest request) {
        requireAdmin(request);
        List<Map<String, Object>> statuses = getServices().stream().map(this::checkHealth).toList();
        audit("gateway", "GET", "/admin/api/services", 200, "Services list requested");
        return ResponseEntity.ok(statuses);
    }

    // GET /admin/api/services/{serviceKey}/health
    @GetMapping("/services/{serviceKey}/health")
    public ResponseEntity<?> getServiceHealth(@PathVariable String serviceKey, HttpServletRequest request) {
        requireAdmin(request);
        ServiceInfo svc = getServices().stream()
                .filter(s -> s.key().equals(serviceKey))
                .findFirst()
                .orElse(null);
        if (svc == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Servicio no encontrado: " + serviceKey));
        }
        Map<String, Object> health = checkHealth(svc);
        audit(serviceKey, "GET", "/admin/api/services/" + serviceKey + "/health", 200, "Health check for " + svc.name());
        return ResponseEntity.ok(health);
    }

    // POST /admin/api/services/{serviceKey}/restart — conceptual restart (redeploy hint)
    @PostMapping("/services/{serviceKey}/restart")
    public ResponseEntity<?> restartService(@PathVariable String serviceKey, HttpServletRequest request) {
        requireAdmin(request);
        ServiceInfo svc = getServices().stream()
                .filter(s -> s.key().equals(serviceKey))
                .findFirst()
                .orElse(null);
        if (svc == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Servicio no encontrado: " + serviceKey));
        }
        audit(serviceKey, "POST", "/admin/api/services/" + serviceKey + "/restart", 200, "Restart requested for " + svc.name());
        return ResponseEntity.ok(Map.of(
                "message", "Restart signal sent to " + svc.name(),
                "serviceKey", serviceKey,
                "note", "En Railway, el reinicio se gestiona desde el dashboard o CLI"
        ));
    }

    // GET /admin/api/audit
    @GetMapping("/audit")
    public ResponseEntity<?> getAudit(
            @RequestParam(required = false) String serviceId,
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest request) {
        requireAdmin(request);

        List<Map<String, Object>> filtered = auditLog;
        if (serviceId != null && !serviceId.isEmpty()) {
            filtered = auditLog.stream()
                    .filter(e -> serviceId.equals(e.get("serviceKey")))
                    .toList();
        }
        List<Map<String, Object>> result = filtered.stream().limit(limit).toList();
        return ResponseEntity.ok(result);
    }

    // GET /admin/api/events — admin events list (includes inactive)
    @GetMapping("/events")
    public ResponseEntity<?> getEvents(HttpServletRequest request) {
        requireAdmin(request);
        String token = request.getHeader("Authorization");
        try {
            HttpHeaders headers = new HttpHeaders();
            if (token != null) headers.set("Authorization", token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            // Fetch ALL events (active + inactive) via the admin endpoint
            ResponseEntity<String> resp = restTemplate.exchange(
                    eventServiceUrl + "/events/admin/all", HttpMethod.GET, entity, String.class);
            audit("event-service", "GET", "/admin/api/events", resp.getStatusCode().value(), "Admin fetched events list");
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
        } catch (Exception e) {
            audit("event-service", "GET", "/admin/api/events", 500, "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener eventos: " + e.getMessage()));
        }
    }

    // POST /admin/api/events — create event
    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody String body, HttpServletRequest request) {
        requireAdmin(request);
        String token = request.getHeader("Authorization");
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (token != null) headers.set("Authorization", token);
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                    eventServiceUrl + "/events", HttpMethod.POST, entity, String.class);
            audit("event-service", "POST", "/admin/api/events", resp.getStatusCode().value(), "Admin created event");
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
        } catch (Exception e) {
            audit("event-service", "POST", "/admin/api/events", 500, "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error al crear evento: " + e.getMessage()));
        }
    }

    // PUT /admin/api/events/{id} — update event
    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody String body, HttpServletRequest request) {
        requireAdmin(request);
        String token = request.getHeader("Authorization");
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (token != null) headers.set("Authorization", token);
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                    eventServiceUrl + "/events/" + id, HttpMethod.PUT, entity, String.class);
            audit("event-service", "PUT", "/admin/api/events/" + id, resp.getStatusCode().value(), "Admin updated event #" + id);
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
        } catch (Exception e) {
            audit("event-service", "PUT", "/admin/api/events/" + id, 500, "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar evento: " + e.getMessage()));
        }
    }

    // PUT /admin/api/events/{id}/toggle-active — toggle active/inactive
    @PutMapping("/events/{id}/toggle-active")
    public ResponseEntity<?> toggleEventActive(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        String token = request.getHeader("Authorization");
        try {
            HttpHeaders headers = new HttpHeaders();
            if (token != null) headers.set("Authorization", token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                    eventServiceUrl + "/events/" + id + "/toggle-active", HttpMethod.PUT, entity, String.class);
            audit("event-service", "PUT", "/admin/api/events/" + id + "/toggle-active", resp.getStatusCode().value(), "Admin toggled event #" + id);
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
        } catch (Exception e) {
            audit("event-service", "PUT", "/admin/api/events/" + id + "/toggle-active", 500, "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error al cambiar estado: " + e.getMessage()));
        }
    }

    // GET /admin/api/events/{eventId}/subscribers — get subscribers for an event
    @GetMapping("/events/{eventId}/subscribers")
    public ResponseEntity<?> getEventSubscribers(@PathVariable Long eventId, HttpServletRequest request) {
        requireAdmin(request);
        try {
            // Get inscriptions from inscrip-service
            ResponseEntity<String> inscResp = restTemplate.getForEntity(
                    inscripServiceUrl + "/inscriptions/event/" + eventId, String.class);
            audit("inscrip-service", "GET", "/admin/api/events/" + eventId + "/subscribers",
                    inscResp.getStatusCode().value(), "Admin fetched subscribers for event #" + eventId);

            // Try to enrich with user data from user-service
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<Map<String, Object>> inscriptions = mapper.readValue(inscResp.getBody(),
                        mapper.getTypeFactory().constructCollectionType(List.class, Map.class));

                List<Map<String, Object>> enriched = new ArrayList<>();
                for (Map<String, Object> insc : inscriptions) {
                    Map<String, Object> entry = new LinkedHashMap<>(insc);
                    Object userIdObj = insc.get("userId");
                    if (userIdObj != null) {
                        try {
                            ResponseEntity<String> userResp = restTemplate.getForEntity(
                                    userServiceUrl + "/users/auth/" + userIdObj, String.class);
                            Map<String, Object> userData = mapper.readValue(userResp.getBody(), Map.class);
                            entry.put("userName", userData.getOrDefault("nombre", "") + " " + userData.getOrDefault("apellido", ""));
                            entry.put("userEmail", "");
                        } catch (Exception ignored) {
                            entry.put("userName", "Usuario #" + userIdObj);
                            entry.put("userEmail", "");
                        }
                    }
                    enriched.add(entry);
                }
                return ResponseEntity.ok(enriched);
            } catch (Exception e) {
                // If enrichment fails, return raw inscriptions
                return ResponseEntity.status(inscResp.getStatusCode()).body(inscResp.getBody());
            }
        } catch (Exception e) {
            audit("inscrip-service", "GET", "/admin/api/events/" + eventId + "/subscribers", 500, "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener suscriptores: " + e.getMessage()));
        }
    }

    // POST /admin/api/services/{serviceKey}/toggle — enable/disable a service for testing
    @PostMapping("/services/{serviceKey}/toggle")
    public ResponseEntity<?> toggleService(@PathVariable String serviceKey, HttpServletRequest request) {
        requireAdmin(request);
        ServiceInfo svc = getServices().stream()
                .filter(s -> s.key().equals(serviceKey))
                .findFirst()
                .orElse(null);
        if (svc == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Servicio no encontrado: " + serviceKey));
        }
        boolean wasDisabled = disabledServices.contains(serviceKey);
        if (wasDisabled) {
            disabledServices.remove(serviceKey);
        } else {
            disabledServices.add(serviceKey);
        }
        String action = wasDisabled ? "habilitado" : "deshabilitado";
        audit(serviceKey, "POST", "/admin/api/services/" + serviceKey + "/toggle", 200,
                "Admin " + action + " " + svc.name());
        return ResponseEntity.ok(Map.of(
                "serviceKey", serviceKey,
                "name", svc.name(),
                "disabled", !wasDisabled,
                "message", svc.name() + " " + action + " para pruebas"
        ));
    }

    // GET /admin/api/services/disabled — get list of disabled services
    @GetMapping("/services/disabled")
    public ResponseEntity<?> getDisabledServices(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(disabledServices);
    }

    // Public access to disabled services set (used by HealthController)
    public Set<String> getDisabledServicesSet() {
        return disabledServices;
    }

    // Exception handler for security errors
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleSecurity(SecurityException ex) {
        return ResponseEntity.status(403).body(Map.of(
                "error", "Acceso denegado",
                "message", ex.getMessage()
        ));
    }
}
