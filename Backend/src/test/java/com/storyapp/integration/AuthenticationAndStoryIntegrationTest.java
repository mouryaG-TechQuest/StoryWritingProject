package com.storyapp.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.TestPropertySource;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class AuthenticationAndStoryIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void registerLoginCreateAndFetchStory() {
        // Register
        Map<String, String> reg = new HashMap<>();
        reg.put("username", "testuser");
        reg.put("password", "testpass");
        ResponseEntity<?> regResp = restTemplate.postForEntity("/api/auth/register", reg, Object.class);
        assertThat(regResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Login
        ResponseEntity<?> loginResp = restTemplate.postForEntity("/api/auth/login", reg, Object.class);
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> loginBody = (Map<String, Object>) loginResp.getBody();
        String token = loginBody != null ? (String) loginBody.get("token") : null;
        assertThat(token).isNotEmpty();

        // Create story
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token != null ? token : "");
        headers.setContentType(MediaType.APPLICATION_JSON);
        String storyJson = "{\"title\":\"My Test Story\",\"content\":\"Once upon a time...\"}";
        HttpEntity<String> entity = new HttpEntity<>(storyJson, headers);
        ResponseEntity<?> createResp = restTemplate.postForEntity("/api/stories", entity, Object.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Fetch all stories
        ResponseEntity<Object[]> allResp = restTemplate.getForEntity("/api/stories", Object[].class);
        assertThat(allResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(allResp.getBody()).isNotEmpty();
    }
}
