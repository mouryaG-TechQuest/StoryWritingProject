package com.storyapp.repository;

import com.storyapp.model.Story;
import com.storyapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findAllByAuthor(User author);
}
