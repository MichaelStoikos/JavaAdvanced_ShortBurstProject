package com.mindmap.graphql.input;

import lombok.Data;

@Data
public class UpdateNodeInput {
    private String label;
    private Double x;
    private Double y;
    private String color;
    private String shape;
    private Integer size;
    private String data;
}

