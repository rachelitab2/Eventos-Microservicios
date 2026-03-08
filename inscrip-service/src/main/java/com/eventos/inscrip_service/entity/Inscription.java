package com.eventos.inscrip_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad Inscription
 * Propósito: Clase que mapea directamente con la tabla "inscriptions" en la base de datos MySQL.
 * Representa la persistencia de una inscripción real en el sistema.
 */
@Entity
@Table(name = "inscriptions")
@Data // Provee Getters, Setters, Equals y HashCode de forma automática para simplificar el código.
@NoArgsConstructor // Crea el constructor sin argumentos requerido por JPA para instanciar la entidad.
@AllArgsConstructor // Genera un constructor con todos los campos para facilitar pruebas.
@Builder // Implementa el patrón Builder para una creación de objetos más legible y flexible.
public class Inscription {

    @Id // Identifica este campo como la Llave Primaria (PK).
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Delega la generación del ID al autoincrement de MySQL.
    private Long id;

    // Propósito: Almacena el ID del usuario. No usamos un objeto User para mantener
    // la independencia entre microservicios (Loose Coupling).
    private Long userId;

    // Propósito: Almacena el ID del evento. De igual forma, solo guardamos el ID
    // para cumplir con la arquitectura de microservicios.
    private Long eventId;

    // Propósito: Campo de auditoría para saber cuándo ocurrió la inscripción.
    private LocalDateTime inscriptionDate;

    // Propósito: Estado actual de la inscripción (ej: CONFIRMED, CANCELLED).
    // Permite manejar la lógica de negocio de cupos y cancelaciones.
    private String status;
}
