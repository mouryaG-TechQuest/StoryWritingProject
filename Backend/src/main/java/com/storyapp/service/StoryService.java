package com.storyapp.service;

import com.storyapp.dto.CharacterRequest;
import com.storyapp.dto.CharacterResponse;
import com.storyapp.dto.StoryRequest;
import com.storyapp.dto.StoryResponse;
import com.storyapp.exception.ResourceNotFoundException;
import com.storyapp.model.Character;
import com.storyapp.model.Story;
import com.storyapp.model.User;
import com.storyapp.repository.CharacterRepository;
import com.storyapp.repository.StoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoryService {
    private final StoryRepository storyRepository;
    private final CharacterRepository characterRepository;

    public StoryService(StoryRepository storyRepository, CharacterRepository characterRepository) {
        this.storyRepository = storyRepository;
        this.characterRepository = characterRepository;
    }

    @Transactional
    public StoryResponse createStory(StoryRequest request, User author) {
        Story story = new Story(request.getTitle(), request.getContent(), author);
        Story saved = storyRepository.save(story);

        if (request.getCharacters() != null) {
            for (CharacterRequest cr : request.getCharacters()) {
                Character c = new Character(cr.getName(), cr.getDescription(), saved);
                c.setRole(cr.getRole());
                characterRepository.save(c);
                saved.getCharacters().add(c);
            }
        }

        return convertToResponse(saved);
    }

    public List<StoryResponse> getAllStories() {
        return storyRepository.findAll().stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<StoryResponse> getUserStories(User user) {
        return storyRepository.findAllByAuthor(user).stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public StoryResponse getStoryById(Long id) {
        if (id == null) throw new IllegalArgumentException("Id cannot be null");
        return storyRepository.findById(id).map(this::convertToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
    }

    @Transactional
    public StoryResponse updateStory(Long id, StoryRequest request, User user) {
        if (id == null) throw new IllegalArgumentException("Id cannot be null");
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getAuthor().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");

        story.setTitle(request.getTitle());
        story.setContent(request.getContent());

        // Remove old characters and add new ones
        story.getCharacters().clear();
        if (request.getCharacters() != null) {
            for (CharacterRequest cr : request.getCharacters()) {
                Character c = new Character(cr.getName(), cr.getDescription(), story);
                c.setRole(cr.getRole());
                characterRepository.save(c);
                story.getCharacters().add(c);
            }
        }

        Story updated = storyRepository.save(story);
        return convertToResponse(updated);
    }

    @Transactional
    public void deleteStory(Long id, User user) {
        if (id == null) throw new IllegalArgumentException("Id cannot be null");
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getAuthor().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        storyRepository.delete(story);
    }

    private StoryResponse convertToResponse(Story story) {
        StoryResponse resp = new StoryResponse();
        resp.setId(story.getId());
        resp.setTitle(story.getTitle());
        resp.setContent(story.getContent());
        resp.setAuthorUsername(story.getAuthor() != null ? story.getAuthor().getUsername() : null);
        List<CharacterResponse> chars = story.getCharacters().stream().map(c -> {
            CharacterResponse cr = new CharacterResponse();
            cr.setId(c.getId());
            cr.setName(c.getName());
            cr.setDescription(c.getDescription());
            cr.setRole(c.getRole());
            return cr;
        }).collect(Collectors.toList());
        resp.setCharacters(chars);
        return resp;
    }
}
