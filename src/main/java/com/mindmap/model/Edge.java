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
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Document(collection = "edges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Edge {
    
    @Id
    private String id;
    
    @Indexed
    private String boardId;
    
    private String source;
    
    private String target;
    
    private String label;
    
    private String color;
    
    private String lineStyle;
    
    @DBRef
    private User createdBy;
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
}

