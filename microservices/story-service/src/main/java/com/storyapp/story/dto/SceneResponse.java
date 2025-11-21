package com.storyapp.story.dto;

import java.util.List;

public class SceneResponse {
    private Long id;
    private String title;
    private String description;
    private Integer order;
    private List<String> characters;
    private List<String> imageUrls;
    private List<String> videoUrls;
    private List<String> audioUrls;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getOrder() { return order; }
    public void setOrder(Integer order) { this.order = order; }

    public List<String> getCharacters() { return characters; }
    public void setCharacters(List<String> characters) { this.characters = characters; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public List<String> getVideoUrls() { return videoUrls; }
    public void setVideoUrls(List<String> videoUrls) { this.videoUrls = videoUrls; }

    public List<String> getAudioUrls() { return audioUrls; }
    public void setAudioUrls(List<String> audioUrls) { this.audioUrls = audioUrls; }
}
