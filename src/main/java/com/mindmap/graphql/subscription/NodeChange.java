package com.mindmap.graphql.subscription;

import com.mindmap.model.Node;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeChange {
    private Node node;
    private String nodeId;
    private ChangeType changeType;
}

