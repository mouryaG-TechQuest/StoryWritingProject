package com.storyapp.story.controller;

import com.storyapp.story.dto.StoryRequest;
import com.storyapp.story.dto.StoryResponse;
import com.storyapp.story.dto.CommentRequest;
import com.storyapp.story.dto.CommentResponse;
import com.storyapp.story.service.StoryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stories")
@SuppressWarnings("null")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping
    public ResponseEntity<StoryResponse> createStory(@RequestBody StoryRequest request, Authentication auth) {
        String authorUsername = auth.getName();
        StoryResponse response = storyService.createStory(request, authorUsername);
        return ResponseEntity.created(URI.create("/api/stories/" + response.getId())).body(response);
    }

    @GetMapping
    public List<StoryResponse> listStories(Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return storyService.getAllStoriesForUser(username);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoryResponse> getStory(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        StoryResponse resp = username != null 
            ? storyService.getStoryByIdForUser(id, username)
            : storyService.getStoryById(id);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my-stories")
    public List<StoryResponse> myStories(Authentication auth) {
        String authorUsername = auth.getName();
        return storyService.getUserStories(authorUsername);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoryResponse> updateStory(@PathVariable Long id, @RequestBody StoryRequest request, Authentication auth) {
        String authorUsername = auth.getName();
        StoryResponse updated = storyService.updateStory(id, request, authorUsername);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id, Authentication auth) {
        String authorUsername = auth.getName();
        storyService.deleteStory(id, authorUsername);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle-publish")
    public ResponseEntity<Void> togglePublish(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        storyService.togglePublishStatus(id, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<StoryResponse> likeStory(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        StoryResponse response = storyService.likeStory(id, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<StoryResponse> unlikeStory(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        StoryResponse response = storyService.unlikeStory(id, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<StoryResponse> addToFavorites(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        StoryResponse response = storyService.addToFavorites(id, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<StoryResponse> removeFromFavorites(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        StoryResponse response = storyService.removeFromFavorites(id, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/favorites")
    public List<StoryResponse> getFavorites(Authentication auth) {
        String username = auth.getName();
        return storyService.getFavoriteStories(username);
    }

    @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> urls = new ArrayList<>();
        try {
            Path uploadDir = Paths.get("uploads/stories");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadDir.resolve(filename);
                Files.copy(file.getInputStream(), filePath);
                urls.add("/uploads/stories/" + filename);
            }
            return ResponseEntity.ok(urls);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Comment endpoints
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id, @RequestBody CommentRequest request, Authentication auth) {
        String username = auth.getName();
        CommentResponse response = storyService.addComment(id, username, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> getComments(@PathVariable Long id) {
        return storyService.getComments(id);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication auth) {
        String username = auth.getName();
        storyService.deleteComment(commentId, username);
        return ResponseEntity.noContent().build();
    }

    // Character endpoints
    @PostMapping("/characters")
    public ResponseEntity<com.storyapp.story.dto.CharacterResponse> createCharacter(
            @RequestBody com.storyapp.story.dto.CharacterRequest request, 
            Authentication auth) {
        String username = auth.getName();
        com.storyapp.story.dto.CharacterResponse response = storyService.createCharacter(request, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/characters/{id}")
    public ResponseEntity<com.storyapp.story.dto.CharacterResponse> updateCharacter(
            @PathVariable Long id,
            @RequestBody com.storyapp.story.dto.CharacterRequest request, 
            Authentication auth) {
        String username = auth.getName();
        com.storyapp.story.dto.CharacterResponse response = storyService.updateCharacter(id, request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/characters")
    public List<com.storyapp.story.dto.CharacterResponse> getAllCharacters(Authentication auth) {
        String username = auth.getName();
        return storyService.getAllCharactersForUser(username);
    }

    @DeleteMapping("/characters/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        storyService.deleteCharacter(id, username);
        return ResponseEntity.noContent().build();
    }
}