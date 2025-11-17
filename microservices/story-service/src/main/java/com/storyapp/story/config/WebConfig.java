package com.storyapp.story.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Get absolute path to uploads directory
        Path uploadsPath = Paths.get("uploads").toAbsolutePath();
        String uploadsLocation = "file:" + uploadsPath.toString().replace("\\", "/") + "/";
        
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(uploadsLocation);
    }
}
