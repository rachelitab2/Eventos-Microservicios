package com.eventos.event_service.repository;

import com.eventos.event_service.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByEventIdOrderByCreatedAtDesc(Long eventId);

    Optional<Comment> findByIdAndEventId(Long id, Long eventId);
}