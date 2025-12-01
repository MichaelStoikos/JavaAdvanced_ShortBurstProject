package com.mindmap.graphql.subscription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPosition {
    private String userId;
    private String username;
    private Double x;
    private Double y;
    private String timestamp;
}

