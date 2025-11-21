package com.storyapp.story.controller;

import com.storyapp.story.dto.SceneRequest;
import com.storyapp.story.dto.SceneResponse;
import com.storyapp.story.service.SceneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/scenes")
public class SceneController {

    @Autowired
    private SceneService sceneService;

    @PostMapping
    public ResponseEntity<SceneResponse> createScene(@RequestBody SceneRequest request) {
        return ResponseEntity.ok(sceneService.createScene(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SceneResponse> updateScene(@PathVariable Long id, @RequestBody SceneRequest request) {
        return ResponseEntity.ok(sceneService.updateScene(id, request));
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<SceneResponse>> getScenesByStoryId(@PathVariable Long storyId) {
        return ResponseEntity.ok(sceneService.getScenesByStoryId(storyId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScene(@PathVariable Long id) {
        sceneService.deleteScene(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/media")
    public ResponseEntity<SceneResponse> uploadMedia(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("type") String type) throws IOException {
        return ResponseEntity.ok(sceneService.addMedia(id, files, type));
    }
}
