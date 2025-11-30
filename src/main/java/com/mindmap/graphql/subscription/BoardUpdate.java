package com.mindmap.graphql.subscription;

import com.mindmap.model.Board;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdate {
    private Board board;
    private UpdateType updateType;
}

