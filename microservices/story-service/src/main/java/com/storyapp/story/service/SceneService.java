package com.storyapp.story.service;

import com.storyapp.story.dto.SceneRequest;
import com.storyapp.story.dto.SceneResponse;
import com.storyapp.story.model.Scene;
import com.storyapp.story.model.SceneMedia;
import com.storyapp.story.model.Story;
import com.storyapp.story.repository.SceneMediaRepository;
import com.storyapp.story.repository.SceneRepository;
import com.storyapp.story.repository.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SceneService {

    @Autowired
    private SceneRepository sceneRepository;

    @Autowired
    private SceneMediaRepository sceneMediaRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private MediaStorageService mediaStorageService;

    @SuppressWarnings("null")
    @Transactional
    public SceneResponse createScene(SceneRequest request) {
        if (request.getStoryId() == null) {
            throw new IllegalArgumentException("Story ID cannot be null");
        }
        
        Story story = storyRepository.findById(request.getStoryId())
                .orElseThrow(() -> new RuntimeException("Story not found"));

        Scene scene = new Scene();
        scene.setTitle(request.getTitle());
        scene.setDescription(request.getDescription());
        scene.setOrder(request.getOrder());
        scene.setStory(story);
        scene.setCharacterNames(request.getCharacters());

        Scene savedScene = sceneRepository.save(scene);
        return mapToResponse(savedScene);
    }

    @Transactional
    public SceneResponse updateScene(Long id, SceneRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Scene ID cannot be null");
        }
        
        Scene scene = sceneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scene not found"));

        scene.setTitle(request.getTitle());
        scene.setDescription(request.getDescription());
        scene.setOrder(request.getOrder());
        scene.setCharacterNames(request.getCharacters());

        Scene savedScene = sceneRepository.save(scene);
        return mapToResponse(savedScene);
    }

    public List<SceneResponse> getScenesByStoryId(Long storyId) {
        return sceneRepository.findByStoryIdOrderByOrderAsc(storyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteScene(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Scene ID cannot be null");
        }
        sceneRepository.deleteById(id);
    }

    @Transactional
    public SceneResponse addMedia(Long sceneId, MultipartFile[] files, String type) throws IOException {
        if (sceneId == null) {
            throw new IllegalArgumentException("Scene ID cannot be null");
        }
        
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new RuntimeException("Scene not found"));

        List<String> urls;
        SceneMedia.MediaType mediaType;

        if ("IMAGE".equalsIgnoreCase(type)) {
            urls = imageStorageService.storeSceneImages(files);
            mediaType = SceneMedia.MediaType.IMAGE;
        } else {
            urls = mediaStorageService.storeSceneMedia(files, type);
            mediaType = SceneMedia.MediaType.valueOf(type.toUpperCase());
        }

        for (String url : urls) {
            SceneMedia media = new SceneMedia(url, mediaType, scene);
            sceneMediaRepository.save(media);
            scene.getMedia().add(media);
        }

        return mapToResponse(scene);
    }

    private SceneResponse mapToResponse(Scene scene) {
        SceneResponse response = new SceneResponse();
        response.setId(scene.getId());
        response.setTitle(scene.getTitle());
        response.setDescription(scene.getDescription());
        response.setOrder(scene.getOrder());
        response.setCharacters(scene.getCharacterNames());

        List<String> imageUrls = new ArrayList<>();
        List<String> videoUrls = new ArrayList<>();
        List<String> audioUrls = new ArrayList<>();

        for (SceneMedia media : scene.getMedia()) {
            switch (media.getType()) {
                case IMAGE: imageUrls.add(media.getUrl()); break;
                case VIDEO: videoUrls.add(media.getUrl()); break;
                case AUDIO: audioUrls.add(media.getUrl()); break;
            }
        }

        response.setImageUrls(imageUrls);
        response.setVideoUrls(videoUrls);
        response.setAudioUrls(audioUrls);

        return response;
    }
}
