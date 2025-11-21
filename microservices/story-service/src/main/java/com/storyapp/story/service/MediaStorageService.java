package com.storyapp.story.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class MediaStorageService {

    @Value("${media.upload.dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = Arrays.asList("mp4", "webm", "ogg");
    private static final List<String> ALLOWED_AUDIO_EXTENSIONS = Arrays.asList("mp3", "wav", "ogg", "m4a");

    public List<String> storeSceneMedia(MultipartFile[] files, String type) throws IOException {
        List<String> mediaUrls = new ArrayList<>();
        Path mediaDir = Paths.get(uploadDir, "scenes", type.toLowerCase());
        
        if (!Files.exists(mediaDir)) {
            Files.createDirectories(mediaDir);
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            if (!isValidMediaType(file, type)) {
                throw new IOException("Invalid media type for " + type);
            }

            String uniqueFilename = UUID.randomUUID().toString() + "_" + 
                                   sanitizeFilename(file.getOriginalFilename());
            Path filePath = mediaDir.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            mediaUrls.add("/uploads/scenes/" + type.toLowerCase() + "/" + uniqueFilename);
        }

        return mediaUrls;
    }

    public List<String> storeAudio(MultipartFile[] files) throws IOException {
        return storeSceneMedia(files, "AUDIO");
    }

    public List<String> storeVideos(MultipartFile[] files) throws IOException {
        return storeSceneMedia(files, "VIDEO");
    }

    private boolean isValidMediaType(MultipartFile file, String type) {
        String filename = file.getOriginalFilename();
        if (filename == null) return false;
        String extension = getFileExtension(filename).toLowerCase();

        if ("VIDEO".equalsIgnoreCase(type)) {
            return ALLOWED_VIDEO_EXTENSIONS.contains(extension);
        } else if ("AUDIO".equalsIgnoreCase(type)) {
            return ALLOWED_AUDIO_EXTENSIONS.contains(extension);
        }
        return false;
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDot = filename.lastIndexOf('.');
        return (lastDot == -1) ? "" : filename.substring(lastDot + 1);
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "media";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
