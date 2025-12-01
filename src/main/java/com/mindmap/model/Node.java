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

@Document(collection = "nodes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Node {
    
    @Id
    private String id;
    
    @Indexed
    private String boardId;
    
    private String label;
    
    private Double x;
    
    private Double y;
    
    private String color;
    
    private String shape;
    
    private Integer size;
    
    private Integer width;
    
    private Integer height;
    
    private Integer fontSize;
    
    private Boolean bold;
    
    private Boolean italic;
    
    private String data;
    
    @DBRef
    private User createdBy;
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
}

