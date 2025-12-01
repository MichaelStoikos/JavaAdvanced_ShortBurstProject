package com.mindmap.service;

import com.mindmap.graphql.input.CreateNodeInput;
import com.mindmap.graphql.input.UpdateNodeInput;
import com.mindmap.graphql.subscription.ChangeType;
import com.mindmap.graphql.subscription.NodeChange;
import com.mindmap.model.Node;
import com.mindmap.model.User;
import com.mindmap.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final EdgeService edgeService;
    private final SubscriptionService subscriptionService;

    public List<Node> getNodesByBoardId(String boardId) {
        return nodeRepository.findByBoardId(boardId);
    }

    public Node getNode(String id) {
        return nodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Node not found"));
    }

    public Node createNode(CreateNodeInput input, User createdBy) {
        Node node = Node.builder()
                .boardId(input.getBoardId())
                .label(input.getLabel())
                .x(input.getX())
                .y(input.getY())
                .color(input.getColor())
                .shape(input.getShape())
                .size(input.getSize())
                .data(input.getData())
                .createdBy(createdBy)
                .build();
        
        node = nodeRepository.save(node);
        
        // Publish node creation event
        NodeChange change = NodeChange.builder()
                .node(node)
                .nodeId(node.getId())
                .changeType(ChangeType.CREATED)
                .build();
        subscriptionService.publishNodeChange(input.getBoardId(), change);
        
        return node;
    }

    public Node updateNode(String id, UpdateNodeInput input) {
        Node node = getNode(id);
        
        if (input.getLabel() != null) {
            node.setLabel(input.getLabel());
        }
        if (input.getX() != null) {
            node.setX(input.getX());
        }
        if (input.getY() != null) {
            node.setY(input.getY());
        }
        if (input.getColor() != null) {
            node.setColor(input.getColor());
        }
        if (input.getShape() != null) {
            node.setShape(input.getShape());
        }
        if (input.getSize() != null) {
            node.setSize(input.getSize());
        }
        if (input.getData() != null) {
            node.setData(input.getData());
        }
        
        node = nodeRepository.save(node);
        
        // Publish node update event
        NodeChange change = NodeChange.builder()
                .node(node)
                .nodeId(node.getId())
                .changeType(ChangeType.UPDATED)
                .build();
        subscriptionService.publishNodeChange(node.getBoardId(), change);
        
        return node;
    }

    @Transactional
    public Boolean deleteNode(String id) {
        Node node = getNode(id);
        String boardId = node.getBoardId();
        
        // Delete all edges connected to this node
        edgeService.deleteEdgesByNode(id);
        
        nodeRepository.delete(node);
        
        // Publish node deletion event
        NodeChange change = NodeChange.builder()
                .node(null)
                .nodeId(id)
                .changeType(ChangeType.DELETED)
                .build();
        subscriptionService.publishNodeChange(boardId, change);
        
        return true;
    }

    @Transactional
    public void deleteNodesByBoardId(String boardId) {
        nodeRepository.deleteByBoardId(boardId);
    }
}

