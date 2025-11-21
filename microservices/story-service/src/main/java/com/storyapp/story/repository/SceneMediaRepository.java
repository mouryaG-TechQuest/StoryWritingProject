package com.storyapp.story.repository;

import com.storyapp.story.model.SceneMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SceneMediaRepository extends JpaRepository<SceneMedia, Long> {
}
