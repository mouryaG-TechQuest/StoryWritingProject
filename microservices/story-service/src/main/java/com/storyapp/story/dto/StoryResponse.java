package com.storyapp.story.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StoryResponse {
    private Long id;
    private String title;
    private String content;
    private String description;
    private String writers;
    private String timelineJson;
    private List<String> imageUrls;
    private String authorUsername;
    private LocalDateTime createdAt;
    private List<CharacterResponse> characters;
    private Boolean isPublished;
    private Integer likeCount;
    private Boolean isLikedByCurrentUser;
    private Boolean isFavoritedByCurrentUser;
    private Integer commentCount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getWriters() { return writers; }
    public void setWriters(String writers) { this.writers = writers; }
    public String getTimelineJson() { return timelineJson; }
    public void setTimelineJson(String timelineJson) { this.timelineJson = timelineJson; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<CharacterResponse> getCharacters() { return characters; }
    public void setCharacters(List<CharacterResponse> characters) { this.characters = characters; }
    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }
    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }
    public Boolean getIsLikedByCurrentUser() { return isLikedByCurrentUser; }
    public void setIsLikedByCurrentUser(Boolean isLikedByCurrentUser) { this.isLikedByCurrentUser = isLikedByCurrentUser; }
    public Boolean getIsFavoritedByCurrentUser() { return isFavoritedByCurrentUser; }
    public void setIsFavoritedByCurrentUser(Boolean isFavoritedByCurrentUser) { this.isFavoritedByCurrentUser = isFavoritedByCurrentUser; }
    public Integer getCommentCount() { return commentCount; }
    public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }
}