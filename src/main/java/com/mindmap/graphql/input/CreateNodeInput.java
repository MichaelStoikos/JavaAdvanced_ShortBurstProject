package com.mindmap.graphql.input;

import lombok.Data;

@Data
public class CreateNodeInput {
    private String boardId;
    private String label;
    private Double x;
    private Double y;
    private String color;
    private String shape;
    private Integer size;
    private String data;
}

