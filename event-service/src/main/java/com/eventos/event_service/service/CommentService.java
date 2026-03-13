package com.eventos.event_service.service;

import com.eventos.event_service.dto.CommentRequest;
import com.eventos.event_service.dto.CommentResponse;
import com.eventos.event_service.entity.Comment;
import com.eventos.event_service.entity.Event;
import com.eventos.event_service.exception.EventNotFoundException;
import com.eventos.event_service.repository.CommentRepository;
import com.eventos.event_service.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByEvent(Long eventId) {
        return commentRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse createComment(Long eventId, CommentRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        Comment comment = new Comment();
        comment.setEvent(event);
        comment.setUserId(request.getUserId());
        comment.setUsername(request.getUsername().trim());
        comment.setText(request.getText().trim());
        comment.setRating(request.getRating());

        return toResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long eventId, Long commentId, Long userId) {
        Comment comment = commentRepository.findByIdAndEventId(commentId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("El comentario no existe"));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No puedes eliminar un comentario de otro usuario");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setUserId(comment.getUserId());
        response.setUsername(comment.getUsername());
        response.setText(comment.getText());
        response.setRating(comment.getRating());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}