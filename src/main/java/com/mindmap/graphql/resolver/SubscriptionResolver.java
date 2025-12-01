package com.mindmap.graphql.resolver;

import com.mindmap.graphql.subscription.BoardUpdate;
import com.mindmap.graphql.subscription.CursorPosition;
import com.mindmap.graphql.subscription.EdgeChange;
import com.mindmap.graphql.subscription.NodeChange;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

@Controller
@RequiredArgsConstructor
public class SubscriptionResolver {

    private final com.mindmap.service.SubscriptionService subscriptionService;

    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<BoardUpdate> boardUpdated(@Argument String boardId) {
        return subscriptionService.subscribeToBoardUpdates(boardId);
    }

    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<NodeChange> nodeChanged(@Argument String boardId) {
        return subscriptionService.subscribeToNodeChanges(boardId);
    }

    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<EdgeChange> edgeChanged(@Argument String boardId) {
        return subscriptionService.subscribeToEdgeChanges(boardId);
    }

    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    public Flux<CursorPosition> cursorMoved(@Argument String boardId) {
        return subscriptionService.subscribeToCursorMovements(boardId);
    }
}

