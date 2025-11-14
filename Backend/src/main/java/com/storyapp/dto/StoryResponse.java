package com.storyapp.dto;

import java.util.List;

public class StoryResponse {
    private Long id;
    private String title;
    private String content;
    private String authorUsername;
    private List<CharacterResponse> characters;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public List<CharacterResponse> getCharacters() { return characters; }
    public void setCharacters(List<CharacterResponse> characters) { this.characters = characters; }
}
