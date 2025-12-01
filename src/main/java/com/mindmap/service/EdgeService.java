package com.mindmap.service;

import com.mindmap.graphql.input.CreateEdgeInput;
import com.mindmap.graphql.input.UpdateEdgeInput;
import com.mindmap.graphql.subscription.ChangeType;
import com.mindmap.graphql.subscription.EdgeChange;
import com.mindmap.model.Edge;
import com.mindmap.model.User;
import com.mindmap.repository.EdgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EdgeService {

    private final EdgeRepository edgeRepository;
    private final SubscriptionService subscriptionService;
    
    public EdgeService(EdgeRepository edgeRepository, SubscriptionService subscriptionService) {
        this.edgeRepository = edgeRepository;
        this.subscriptionService = subscriptionService;
    }

    public List<Edge> getEdgesByBoardId(String boardId) {
        return edgeRepository.findByBoardId(boardId);
    }

    public Edge getEdge(String id) {
        return edgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Edge not found"));
    }

    public Edge createEdge(CreateEdgeInput input, User createdBy) {
        Edge edge = Edge.builder()
                .boardId(input.getBoardId())
                .source(input.getSource())
                .target(input.getTarget())
                .label(input.getLabel())
                .color(input.getColor())
                .lineStyle(input.getLineStyle())
                .createdBy(createdBy)
                .build();
        
        edge = edgeRepository.save(edge);
        
        // Publish edge creation event
        EdgeChange change = EdgeChange.builder()
                .edge(edge)
                .edgeId(edge.getId())
                .changeType(ChangeType.CREATED)
                .build();
        subscriptionService.publishEdgeChange(input.getBoardId(), change);
        
        return edge;
    }

    public Edge updateEdge(String id, UpdateEdgeInput input) {
        Edge edge = getEdge(id);
        
        if (input.getLabel() != null) {
            edge.setLabel(input.getLabel());
        }
        if (input.getColor() != null) {
            edge.setColor(input.getColor());
        }
        if (input.getLineStyle() != null) {
            edge.setLineStyle(input.getLineStyle());
        }
        
        edge = edgeRepository.save(edge);
        
        // Publish edge update event
        EdgeChange change = EdgeChange.builder()
                .edge(edge)
                .edgeId(edge.getId())
                .changeType(ChangeType.UPDATED)
                .build();
        subscriptionService.publishEdgeChange(edge.getBoardId(), change);
        
        return edge;
    }

    public Boolean deleteEdge(String id) {
        Edge edge = getEdge(id);
        String boardId = edge.getBoardId();
        
        edgeRepository.delete(edge);
        
        // Publish edge deletion event
        EdgeChange change = EdgeChange.builder()
                .edge(null)
                .edgeId(id)
                .changeType(ChangeType.DELETED)
                .build();
        subscriptionService.publishEdgeChange(boardId, change);
        
        return true;
    }

    @Transactional
    public void deleteEdgesByBoardId(String boardId) {
        edgeRepository.deleteByBoardId(boardId);
    }

    @Transactional
    public void deleteEdgesByNode(String nodeId) {
        edgeRepository.deleteBySourceOrTarget(nodeId, nodeId);
    }
}

