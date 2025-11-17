package com.storyapp.story.service;

import com.storyapp.story.dto.*;
import com.storyapp.story.model.Character;
import com.storyapp.story.model.StoryImage;
import com.storyapp.story.model.Like;
import com.storyapp.story.model.Favorite;
import com.storyapp.story.model.Comment;
import com.storyapp.story.exception.ResourceNotFoundException;
import com.storyapp.story.exception.UnauthorizedException;
import com.storyapp.story.model.Story;
import com.storyapp.story.repository.CharacterRepository;
import com.storyapp.story.repository.StoryRepository;
import com.storyapp.story.repository.LikeRepository;
import com.storyapp.story.repository.FavoriteRepository;
import com.storyapp.story.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class StoryService {
    private final StoryRepository storyRepository;
    private final CharacterRepository characterRepository;
    private final LikeRepository likeRepository;
    private final FavoriteRepository favoriteRepository;
    private final CommentRepository commentRepository;

    public StoryService(StoryRepository storyRepository, CharacterRepository characterRepository, 
                        LikeRepository likeRepository, FavoriteRepository favoriteRepository,
                        CommentRepository commentRepository) {
        this.storyRepository = storyRepository;
        this.characterRepository = characterRepository;
        this.likeRepository = likeRepository;
        this.favoriteRepository = favoriteRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public StoryResponse createStory(StoryRequest request, String authorUsername) {
        // Validate title is not empty
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Story title is required");
        }
        
        // Check if title already exists for this user
        if (storyRepository.findByTitleAndAuthorUsername(request.getTitle(), authorUsername).isPresent()) {
            throw new IllegalArgumentException("A story with this title already exists");
        }
        
        Story story = new Story(request.getTitle(), request.getContent(), authorUsername);
        story.setDescription(request.getDescription());
        story.setWriters(request.getWriters());
        story.setTimelineJson(request.getTimelineJson());
        story.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : false);
        Story saved = storyRepository.save(story);

        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                StoryImage img = new StoryImage(url, saved);
                saved.getImages().add(img);
            }
        }

        if (request.getCharacters() != null) {
            for (CharacterRequest cr : request.getCharacters()) {
                Character c = new Character(cr.getName(), cr.getDescription(), saved);
                c.setRole(cr.getRole());
                c.setActorName(cr.getActorName());
                c.setImageUrl(cr.getImageUrl());
                characterRepository.save(c);
                saved.getCharacters().add(c);
            }
        }
        return convertToResponse(saved, authorUsername);
    }

    public List<StoryResponse> getAllStories() {
        return storyRepository.findAll().stream()
            .filter(Story::getIsPublished)
            .map(s -> convertToResponse(s, null))
            .collect(Collectors.toList());
    }

    public List<StoryResponse> getAllStoriesForUser(String username) {
        return storyRepository.findAll().stream()
            .filter(Story::getIsPublished)
            .map(s -> convertToResponse(s, username))
            .collect(Collectors.toList());
    }

    public List<StoryResponse> getUserStories(String username) {
        return storyRepository.findAllByAuthorUsername(username).stream()
            .map(s -> convertToResponse(s, username))
            .collect(Collectors.toList());
    }

    public StoryResponse getStoryById(Long id) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        return convertToResponse(story, null);
    }

    public StoryResponse getStoryByIdForUser(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        return convertToResponse(story, username);
    }

    @Transactional
    public StoryResponse updateStory(Long id, StoryRequest request, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getAuthorUsername().equals(username)) throw new UnauthorizedException("Unauthorized");

        // Validate title is not empty
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Story title is required");
        }
        
        // Check if title already exists for this user (excluding current story)
        if (storyRepository.findByTitleAndAuthorUsernameAndIdNot(request.getTitle(), username, id).isPresent()) {
            throw new IllegalArgumentException("A story with this title already exists");
        }

        story.setTitle(request.getTitle());
        story.setContent(request.getContent());
        story.setDescription(request.getDescription());
        story.setWriters(request.getWriters());
        story.setTimelineJson(request.getTimelineJson());
        if (request.getIsPublished() != null) {
            story.setIsPublished(request.getIsPublished());
        }

        // Delete old characters and images
        for (Character old : story.getCharacters()) {
            characterRepository.delete(old);
        }
        story.getCharacters().clear();
        story.getImages().clear();

        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                StoryImage img = new StoryImage(url, story);
                story.getImages().add(img);
            }
        }

        if (request.getCharacters() != null) {
            for (CharacterRequest cr : request.getCharacters()) {
                Character c = new Character(cr.getName(), cr.getDescription(), story);
                c.setRole(cr.getRole());
                c.setActorName(cr.getActorName());
                c.setImageUrl(cr.getImageUrl());
                characterRepository.save(c);
                story.getCharacters().add(c);
            }
        }
        Story updated = storyRepository.save(story);
        return convertToResponse(updated, username);
    }

    @Transactional
    public void togglePublishStatus(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getAuthorUsername().equals(username)) throw new UnauthorizedException("Unauthorized");
        story.setIsPublished(!story.getIsPublished());
        storyRepository.save(story);
    }

    @Transactional
    public StoryResponse likeStory(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!likeRepository.existsByStoryAndUsername(story, username)) {
            Like like = new Like(story, username);
            likeRepository.save(like);
            story.setLikeCount(story.getLikeCount() + 1);
            storyRepository.save(story);
        }
        return convertToResponse(story, username);
    }

    @Transactional
    public StoryResponse unlikeStory(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        Like like = likeRepository.findByStoryAndUsername(story, username).orElse(null);
        if (like != null) {
            likeRepository.delete(like);
            story.setLikeCount(Math.max(0, story.getLikeCount() - 1));
            storyRepository.save(story);
        }
        return convertToResponse(story, username);
    }

    @Transactional
    public StoryResponse addToFavorites(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!favoriteRepository.existsByStoryAndUsername(story, username)) {
            Favorite favorite = new Favorite(story, username);
            favoriteRepository.save(favorite);
        }
        return convertToResponse(story, username);
    }

    @Transactional
    public StoryResponse removeFromFavorites(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        Favorite favorite = favoriteRepository.findByStoryAndUsername(story, username).orElse(null);
        if (favorite != null) {
            favoriteRepository.delete(favorite);
        }
        return convertToResponse(story, username);
    }

    public List<StoryResponse> getFavoriteStories(String username) {
        List<Favorite> favorites = favoriteRepository.findByUsername(username);
        return favorites.stream()
            .map(fav -> convertToResponse(fav.getStory(), username))
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteStory(Long id, String username) {
        Story story = storyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getAuthorUsername().equals(username)) throw new UnauthorizedException("Unauthorized");
        storyRepository.delete(story);
    }

    private StoryResponse convertToResponse(Story story, String currentUsername) {
        StoryResponse resp = new StoryResponse();
        resp.setId(story.getId());
        resp.setTitle(story.getTitle());
        resp.setContent(story.getContent());
        resp.setDescription(story.getDescription());
        resp.setWriters(story.getWriters());
        resp.setTimelineJson(story.getTimelineJson());
        resp.setAuthorUsername(story.getAuthorUsername());
        resp.setCreatedAt(story.getCreatedAt());
        resp.setIsPublished(story.getIsPublished());
        resp.setLikeCount(story.getLikeCount());
        resp.setCommentCount((int) commentRepository.countByStory(story));
        
        if (currentUsername != null) {
            resp.setIsLikedByCurrentUser(likeRepository.existsByStoryAndUsername(story, currentUsername));
            resp.setIsFavoritedByCurrentUser(favoriteRepository.existsByStoryAndUsername(story, currentUsername));
        } else {
            resp.setIsLikedByCurrentUser(false);
            resp.setIsFavoritedByCurrentUser(false);
        }
        
        List<String> imageUrls = story.getImages().stream()
            .map(StoryImage::getUrl)
            .collect(Collectors.toList());
        resp.setImageUrls(imageUrls);
        
        List<CharacterResponse> chars = story.getCharacters().stream().map(c -> {
            CharacterResponse cr = new CharacterResponse();
            cr.setId(c.getId());
            cr.setName(c.getName());
            cr.setDescription(c.getDescription());
            cr.setRole(c.getRole());
            cr.setActorName(c.getActorName());
            cr.setImageUrl(c.getImageUrl());
            return cr;
        }).collect(Collectors.toList());
        resp.setCharacters(chars);
        return resp;
    }

    // Comment methods
    @Transactional
    public CommentResponse addComment(Long storyId, String username, CommentRequest request) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        Comment comment = new Comment(story, username, request.getContent());
        Comment saved = commentRepository.save(comment);
        return convertToCommentResponse(saved);
    }

    public List<CommentResponse> getComments(Long storyId) {
        Story story = storyRepository.findById(storyId).orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        return commentRepository.findByStoryOrderByCreatedAtDesc(story).stream()
            .map(this::convertToCommentResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getUsername().equals(username)) throw new UnauthorizedException("Unauthorized");
        commentRepository.delete(comment);
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse resp = new CommentResponse();
        resp.setId(comment.getId());
        resp.setStoryId(comment.getStory().getId());
        resp.setUsername(comment.getUsername());
        resp.setContent(comment.getContent());
        resp.setCreatedAt(comment.getCreatedAt());
        return resp;
    }

    // Character CRUD methods
    @Transactional
    public CharacterResponse createCharacter(CharacterRequest request, String username) {
        Character character = new Character();
        character.setName(request.getName());
        character.setDescription(request.getDescription());
        character.setRole(request.getRole());
        character.setActorName(request.getActorName());
        character.setImageUrl(request.getImageUrl());
        // Note: This creates a standalone character without a story association
        // It will be associated with a story when the story is created/updated
        Character saved = characterRepository.save(character);
        return convertToCharacterResponse(saved);
    }

    @Transactional
    public CharacterResponse updateCharacter(Long id, CharacterRequest request, String username) {
        Character character = characterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Character not found"));
        
        character.setName(request.getName());
        character.setDescription(request.getDescription());
        character.setRole(request.getRole());
        character.setActorName(request.getActorName());
        character.setImageUrl(request.getImageUrl());
        
        Character updated = characterRepository.save(character);
        return convertToCharacterResponse(updated);
    }

    public List<CharacterResponse> getAllCharactersForUser(String username) {
        // Get all characters from stories owned by the user
        List<Story> userStories = storyRepository.findAllByAuthorUsername(username);
        return userStories.stream()
            .flatMap(story -> story.getCharacters().stream())
            .map(this::convertToCharacterResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCharacter(Long id, String username) {
        Character character = characterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Character not found"));
        
        // Check if user owns the story this character belongs to
        if (character.getStory() != null && 
            !character.getStory().getAuthorUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized");
        }
        
        characterRepository.delete(character);
    }

    private CharacterResponse convertToCharacterResponse(Character character) {
        CharacterResponse resp = new CharacterResponse();
        resp.setId(character.getId());
        resp.setName(character.getName());
        resp.setDescription(character.getDescription());
        resp.setRole(character.getRole());
        resp.setActorName(character.getActorName());
        resp.setImageUrl(character.getImageUrl());
        return resp;
    }
}