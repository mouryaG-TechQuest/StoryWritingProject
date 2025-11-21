package com.storyapp.story.dto;

import java.util.List;

public class SceneRequest {
    private String title;
    private String description;
    private Integer order;
    private Long storyId;
    private List<String> characters;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getOrder() { return order; }
    public void setOrder(Integer order) { this.order = order; }

    public Long getStoryId() { return storyId; }
    public void setStoryId(Long storyId) { this.storyId = storyId; }

    public List<String> getCharacters() { return characters; }
    public void setCharacters(List<String> characters) { this.characters = characters; }
}
