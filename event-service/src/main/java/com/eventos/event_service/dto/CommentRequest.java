package com.eventos.event_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentRequest {

    @NotNull(message = "userId es obligatorio")
    private Long userId;

    @NotBlank(message = "username es obligatorio")
    private String username;

    @NotBlank(message = "El comentario no puede estar vacío")
    private String text;

    @NotNull(message = "rating es obligatorio")
    @Min(value = 1, message = "rating debe ser entre 1 y 5")
    @Max(value = 5, message = "rating debe ser entre 1 y 5")
    private Integer rating;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}