package com.mindmap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "boards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Board {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    @DBRef
    private User owner;
    
    @Builder.Default
    private List<Collaborator> collaborators = new ArrayList<>();
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
}

