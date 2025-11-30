package com.mindmap.graphql.input;

import lombok.Data;

@Data
public class CreateEdgeInput {
    private String boardId;
    private String source;
    private String target;
    private String label;
    private String color;
    private String lineStyle;
}

