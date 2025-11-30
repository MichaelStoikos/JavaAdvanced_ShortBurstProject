package com.mindmap.config;

import com.mindmap.model.User;
import com.mindmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create a demo user if no users exist
        if (userRepository.count() == 0) {
            User demoUser = User.builder()
                    .username("demo")
                    .email("demo@example.com")
                    .password(passwordEncoder.encode("demo123"))
                    .roles(Set.of("USER"))
                    .enabled(true)
                    .build();
            
            userRepository.save(demoUser);
            log.info("Demo user created - Username: demo, Password: demo123");
        }
    }
}

