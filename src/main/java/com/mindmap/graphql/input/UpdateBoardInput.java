package com.mindmap.graphql.input;

import lombok.Data;

@Data
public class UpdateBoardInput {
    private String title;
    private String description;
}

