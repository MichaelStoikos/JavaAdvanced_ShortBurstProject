package com.mindmap.service;

import com.mindmap.graphql.input.CreateEdgeInput;
import com.mindmap.graphql.input.UpdateEdgeInput;
import com.mindmap.model.Edge;
import com.mindmap.model.User;
import com.mindmap.repository.EdgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EdgeService {

    private final EdgeRepository edgeRepository;

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
        
        return edgeRepository.save(edge);
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
        
        return edgeRepository.save(edge);
    }

    public Boolean deleteEdge(String id) {
        Edge edge = getEdge(id);
        edgeRepository.delete(edge);
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

