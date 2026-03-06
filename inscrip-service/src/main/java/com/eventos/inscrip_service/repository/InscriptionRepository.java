package com.eventos.inscrip_service.repository;

import com.eventos.inscrip_service.entity.Inscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscriptionRepository extends JpaRepository<Inscription, Long> {
}
