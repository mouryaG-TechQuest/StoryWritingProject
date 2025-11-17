package com.storyapp.story.repository;

import com.storyapp.story.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findAllByAuthorUsername(String authorUsername);
    Optional<Story> findByTitleAndAuthorUsername(String title, String authorUsername);
    Optional<Story> findByTitleAndAuthorUsernameAndIdNot(String title, String authorUsername, Long id);
}