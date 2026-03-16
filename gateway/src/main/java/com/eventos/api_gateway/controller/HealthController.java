package com.eventos.api_gateway.controller;

import java.util.Map;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final AdminController adminController;

    public HealthController(AdminController adminController) {
        this.adminController = adminController;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "gateway");
    }

    @GetMapping("/services/status")
    public Map<String, Object> servicesStatus() {
        Set<String> disabled = adminController.getDisabledServicesSet();
        return Map.of("disabledServices", disabled);
    }
}