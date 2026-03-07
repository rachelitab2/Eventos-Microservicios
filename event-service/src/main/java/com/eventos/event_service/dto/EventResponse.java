package com.eventos.event_service.dto;

import java.time.LocalDateTime;

public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private Integer totalCapacity;
    private Integer availableSpots;
    private String category;
    private Double price;
    private String imageUrl;
    private String instagramUrl;
    private String instagramUser;
    private String facebookUrl;
    private String facebookUser;
    private String whatsappNumber;
    private String tiktokUrl;
    private String tiktokUser;
    private boolean active;
    private LocalDateTime createdAt;
    private String status;

    public EventResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public Integer getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Integer totalCapacity) { this.totalCapacity = totalCapacity; }

    public Integer getAvailableSpots() { return availableSpots; }
    public void setAvailableSpots(Integer availableSpots) { this.availableSpots = availableSpots; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

    public String getInstagramUser() { return instagramUser; }
    public void setInstagramUser(String instagramUser) { this.instagramUser = instagramUser; }

    public String getFacebookUrl() { return facebookUrl; }
    public void setFacebookUrl(String facebookUrl) { this.facebookUrl = facebookUrl; }

    public String getFacebookUser() { return facebookUser; }
    public void setFacebookUser(String facebookUser) { this.facebookUser = facebookUser; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getTiktokUrl() { return tiktokUrl; }
    public void setTiktokUrl(String tiktokUrl) { this.tiktokUrl = tiktokUrl; }

    public String getTiktokUser() { return tiktokUser; }
    public void setTiktokUser(String tiktokUser) { this.tiktokUser = tiktokUser; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}