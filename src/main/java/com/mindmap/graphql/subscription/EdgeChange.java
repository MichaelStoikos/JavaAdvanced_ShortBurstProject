package com.mindmap.graphql.subscription;

import com.mindmap.model.Edge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EdgeChange {
    private Edge edge;
    private String edgeId;
    private ChangeType changeType;
}

