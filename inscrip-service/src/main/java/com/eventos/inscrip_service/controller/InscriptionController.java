package com.eventos.inscrip_service.controller;

import com.eventos.inscrip_service.dto.InscriptionRequest;
import com.eventos.inscrip_service.dto.InscriptionResponse;
import com.eventos.inscrip_service.service.InscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Clase InscriptionController
 * Propósito: Capa de Entrada (API REST). Expone los servicios a otros sistemas o al frontend.
 * Maneja las peticiones HTTP y devuelve respuestas estructuradas.
 */
@RestController
@RequestMapping("/inscriptions") // Define la ruta base para todos los endpoints de este controlador.
@RequiredArgsConstructor
public class InscriptionController {

    private final InscriptionService inscriptionService;

    /**
     * Endpoint: Inscribirse a un evento
     * Propósito: Recibe una solicitud POST para realizar una nueva inscripción.
     * @param request JSON mapeado al DTO InscriptionRequest.
     */
    @PostMapping
    public ResponseEntity<InscriptionResponse> create(@Valid @RequestBody InscriptionRequest request) {
        // Ejecuta la lógica en el servicio y retorna un estatus 201 Created.
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inscriptionService.createInscription(request));
    }

    /**
     * Endpoint: Consultar eventos por usuario
     * Propósito: Recibe una solicitud GET para obtener el historial de un usuario.
     * @param userId Capturado directamente de la URL.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InscriptionResponse>> getByUser(@PathVariable Long userId) {
        // Retorna la lista encontrada con un estatus 200 OK.
        return ResponseEntity.ok(inscriptionService.getUserInscriptions(userId));
    }

    /**
     * Endpoint: Eliminar una inscripcion por ID
     * Proposito: Permite cancelar una reservacion desde "Mis Eventos".
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inscriptionService.deleteInscription(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint: Obtener inscripciones de un evento.
     */
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<InscriptionResponse>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(inscriptionService.getEventInscriptions(eventId));
    }

    /**
     * Endpoint: Contar inscripciones asociadas a un evento.
     */
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Long> countByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(inscriptionService.countByEvent(eventId));
    }

    /**
     * Endpoint: Verificar si un usuario ya esta inscrito en un evento.
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkUserInscription(
            @RequestParam Long userId,
            @RequestParam Long eventId
    ) {
        return ResponseEntity.ok(inscriptionService.isUserInscribed(userId, eventId));
    }
}
