package com.storyapp.story.repository;

import com.storyapp.story.model.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SceneRepository extends JpaRepository<Scene, Long> {
    List<Scene> findByStoryId(Long storyId);
    List<Scene> findByStoryIdOrderByOrderAsc(Long storyId);
}
