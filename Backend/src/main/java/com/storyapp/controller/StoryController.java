package com.storyapp.controller;

import com.storyapp.dto.StoryRequest;
import com.storyapp.dto.StoryResponse;
import com.storyapp.exception.UnauthorizedException;
import com.storyapp.model.User;
import com.storyapp.service.StoryService;
import com.storyapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {
    private final StoryService storyService;
    private final UserRepository userRepository;

    public StoryController(StoryService storyService, UserRepository userRepository) {
        this.storyService = storyService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<StoryResponse> createStory(@RequestBody StoryRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new UnauthorizedException("Unauthorized");
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UnauthorizedException("User not found"));
        StoryResponse resp = storyService.createStory(request, user);
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public List<StoryResponse> getAllStories() {
        return storyService.getAllStories();
    }

    @GetMapping("/my-stories")
    public List<StoryResponse> getUserStories(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new UnauthorizedException("Unauthorized");
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UnauthorizedException("User not found"));
        return storyService.getUserStories(user);
    }

    @GetMapping("/{id}")
    public StoryResponse getStory(@PathVariable("id") Long id) {
        return storyService.getStoryById(id);
    }

    @PutMapping("/{id}")
    public StoryResponse updateStory(@PathVariable("id") Long id, @RequestBody StoryRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new UnauthorizedException("Unauthorized");
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UnauthorizedException("User not found"));
        return storyService.updateStory(id, request, user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable("id") Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new UnauthorizedException("Unauthorized");
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UnauthorizedException("User not found"));
        storyService.deleteStory(id, user);
        return ResponseEntity.ok().build();
    }
}
