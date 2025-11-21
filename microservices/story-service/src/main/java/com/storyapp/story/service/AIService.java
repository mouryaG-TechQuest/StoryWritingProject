package com.storyapp.story.service;

import com.storyapp.story.dto.AIGenerationRequest;
import com.storyapp.story.model.Scene;
import com.storyapp.story.model.Story;
import com.storyapp.story.repository.SceneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Autowired
    private SceneRepository sceneRepository;

    @SuppressWarnings("null")
    public String generateContent(AIGenerationRequest request) {
        if (request.getSceneId() == null) {
            throw new IllegalArgumentException("Scene ID cannot be null");
        }
        
        Scene scene = sceneRepository.findById(request.getSceneId())
                .orElseThrow(() -> new RuntimeException("Scene not found"));

        Story story = scene.getStory();
        List<Scene> previousScenes = sceneRepository.findByStoryIdOrderByOrderAsc(story.getId())
                .stream()
                .filter(s -> s.getOrder() < scene.getOrder())
                .collect(Collectors.toList());

        String prompt = buildPrompt(scene, previousScenes, request.getCustomPrompt(), request.getPromptType());

        // Mock AI Call - In a real implementation, this would call OpenAI/Stable Diffusion API
        return callAIProvider(prompt, request.getPromptType());
    }

    private String buildPrompt(Scene currentScene, List<Scene> previousScenes, String customPrompt, String type) {
        StringBuilder sb = new StringBuilder();
        sb.append("Context: Story titled '").append(currentScene.getStory().getTitle()).append("'. ");
        
        if (!previousScenes.isEmpty()) {
            sb.append("Previous events: ");
            for (Scene s : previousScenes) {
                sb.append(s.getTitle()).append(": ").append(s.getDescription()).append("; ");
            }
        }

        sb.append("Current Scene: ").append(currentScene.getTitle()).append(". ");
        sb.append("Description: ").append(currentScene.getDescription()).append(". ");

        if (!currentScene.getCharacterNames().isEmpty()) {
            sb.append("Characters present: ").append(String.join(", ", currentScene.getCharacterNames())).append(". ");
            // Here we could also fetch Character entities to get their descriptions/image URLs
        }

        if (customPrompt != null && !customPrompt.isEmpty()) {
            sb.append("User Instruction: ").append(customPrompt);
        }

        return sb.toString();
    }

    private String callAIProvider(String prompt, String type) {
        // Placeholder for actual AI integration
        // Return a dummy URL or text based on type
        if ("IMAGE".equalsIgnoreCase(type)) {
            return "https://via.placeholder.com/1024x1024.png?text=AI+Generated+Scene";
        } else if ("VIDEO".equalsIgnoreCase(type)) {
            return "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"; // Dummy video
        } else if ("AUDIO".equalsIgnoreCase(type)) {
            return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Dummy audio
        }
        return "AI Content Generated";
    }
}
