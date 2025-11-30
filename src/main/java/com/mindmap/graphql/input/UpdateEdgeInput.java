package com.mindmap.graphql.input;

import lombok.Data;

@Data
public class UpdateEdgeInput {
    private String label;
    private String color;
    private String lineStyle;
}

