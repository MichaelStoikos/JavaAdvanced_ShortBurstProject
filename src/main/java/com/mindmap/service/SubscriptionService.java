package com.mindmap.service;

import com.mindmap.graphql.subscription.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final Map<String, Sinks.Many<BoardUpdate>> boardUpdateSinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<NodeChange>> nodeChangeSinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<EdgeChange>> edgeChangeSinks = new ConcurrentHashMap<>();

    public Flux<BoardUpdate> subscribeToBoardUpdates(String boardId) {
        return getOrCreateBoardSink(boardId).asFlux();
    }

    public Flux<NodeChange> subscribeToNodeChanges(String boardId) {
        return getOrCreateNodeSink(boardId).asFlux();
    }

    public Flux<EdgeChange> subscribeToEdgeChanges(String boardId) {
        return getOrCreateEdgeSink(boardId).asFlux();
    }

    public void publishBoardUpdate(BoardUpdate update) {
        String boardId = update.getBoard().getId();
        Sinks.Many<BoardUpdate> sink = getOrCreateBoardSink(boardId);
        sink.tryEmitNext(update);
    }

    public void publishNodeChange(String boardId, NodeChange change) {
        Sinks.Many<NodeChange> sink = getOrCreateNodeSink(boardId);
        sink.tryEmitNext(change);
    }

    public void publishEdgeChange(String boardId, EdgeChange change) {
        Sinks.Many<EdgeChange> sink = getOrCreateEdgeSink(boardId);
        sink.tryEmitNext(change);
    }

    private Sinks.Many<BoardUpdate> getOrCreateBoardSink(String boardId) {
        return boardUpdateSinks.computeIfAbsent(boardId, 
            k -> Sinks.many().multicast().directBestEffort());
    }

    private Sinks.Many<NodeChange> getOrCreateNodeSink(String boardId) {
        return nodeChangeSinks.computeIfAbsent(boardId, 
            k -> Sinks.many().multicast().directBestEffort());
    }

    private Sinks.Many<EdgeChange> getOrCreateEdgeSink(String boardId) {
        return edgeChangeSinks.computeIfAbsent(boardId, 
            k -> Sinks.many().multicast().directBestEffort());
    }
}

