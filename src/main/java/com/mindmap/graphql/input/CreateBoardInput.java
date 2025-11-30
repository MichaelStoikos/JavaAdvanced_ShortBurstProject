package com.mindmap.graphql.input;

import lombok.Data;

@Data
public class CreateBoardInput {
    private String title;
    private String description;
}

