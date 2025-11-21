package com.storyapp.story.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scenes")
public class Scene {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // Corresponds to 'event' in frontend

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "scene_order")
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id")
    private Story story;

    @OneToMany(mappedBy = "scene", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SceneMedia> media = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "scene_characters", joinColumns = @JoinColumn(name = "scene_id"))
    @Column(name = "character_name")
    private List<String> characterNames = new ArrayList<>();

    public Scene() {}

    public Scene(String title, String description, Integer order, Story story) {
        this.title = title;
        this.description = description;
        this.order = order;
        this.story = story;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    public List<SceneMedia> getMedia() {
        return media;
    }

    public void setMedia(List<SceneMedia> media) {
        this.media = media;
    }

    public List<String> getCharacterNames() {
        return characterNames;
    }

    public void setCharacterNames(List<String> characterNames) {
        this.characterNames = characterNames;
    }
}
