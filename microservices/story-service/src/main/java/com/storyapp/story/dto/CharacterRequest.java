package com.storyapp.story.dto;

public class CharacterRequest {
    private String name;
    private String description;
    private String role;
    private String actorName;
    private String imageUrl;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}