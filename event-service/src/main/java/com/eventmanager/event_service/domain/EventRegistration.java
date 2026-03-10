package com.eventmanager.event_service.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Registro de inscripción de un usuario a un evento.
 * Usa soft-delete: el campo 'cancelled' en true indica cancelación
 * sin borrar el historial de la inscripción.
 */
@Entity
@Table(name = "event_registrations", uniqueConstraints = @UniqueConstraint(columnNames = { "event_id", "user_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(name = "user_email", nullable = false, length = 150)
    private String userEmail;

    @Column(name = "registration_code", nullable = false, unique = true, length = 50)
    private String registrationCode;

    @Builder.Default
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private boolean cancelled = false;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
