package com.storyapp.dto;

import java.util.List;

public class StoryRequest {
    private String title;
    private String content;
    private List<CharacterRequest> characters;

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public List<CharacterRequest> getCharacters() { return characters; }
    public void setCharacters(List<CharacterRequest> characters) { this.characters = characters; }
}
