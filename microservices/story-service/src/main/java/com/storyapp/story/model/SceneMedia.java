package com.storyapp.story.model;

import jakarta.persistence.*;

@Entity
@Table(name = "scene_media")
public class SceneMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id")
    private Scene scene;

    public enum MediaType {
        IMAGE,
        VIDEO,
        AUDIO
    }

    public SceneMedia() {}

    public SceneMedia(String url, MediaType type, Scene scene) {
        this.url = url;
        this.type = type;
        this.scene = scene;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public Scene getScene() {
        return scene;
    }

    public void setScene(Scene scene) {
        this.scene = scene;
    }
}
