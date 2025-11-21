package com.storyapp.story.controller;

import com.storyapp.story.dto.AIGenerationRequest;
import com.storyapp.story.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generateContent(@RequestBody AIGenerationRequest request) {
        String resultUrl = aiService.generateContent(request);
        return ResponseEntity.ok(Map.of("url", resultUrl));
    }
}
