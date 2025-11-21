package com.storyapp.story.dto;

public class AIGenerationRequest {
    private Long sceneId;
    private String promptType; // IMAGE, VIDEO, AUDIO
    private String customPrompt;

    public Long getSceneId() { return sceneId; }
    public void setSceneId(Long sceneId) { this.sceneId = sceneId; }

    public String getPromptType() { return promptType; }
    public void setPromptType(String promptType) { this.promptType = promptType; }

    public String getCustomPrompt() { return customPrompt; }
    public void setCustomPrompt(String customPrompt) { this.customPrompt = customPrompt; }
}
