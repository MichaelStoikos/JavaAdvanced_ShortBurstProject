package com.mindmap.graphql.resolver;

import com.mindmap.graphql.input.*;
import com.mindmap.graphql.subscription.CursorPosition;
import com.mindmap.model.*;
import com.mindmap.service.BoardService;
import com.mindmap.service.EdgeService;
import com.mindmap.service.NodeService;
import com.mindmap.service.SubscriptionService;
import com.mindmap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class MutationResolver {

    private final BoardService boardService;
    private final NodeService nodeService;
    private final EdgeService edgeService;
    private final SubscriptionService subscriptionService;
    private final SecurityUtils securityUtils;

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Board createBoard(@Argument CreateBoardInput input) {
        User currentUser = securityUtils.getCurrentUser();
        return boardService.createBoard(input, currentUser);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Board updateBoard(@Argument String id, @Argument UpdateBoardInput input) {
        return boardService.updateBoard(id, input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteBoard(@Argument String id) {
        return boardService.deleteBoard(id);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Node createNode(@Argument CreateNodeInput input) {
        User currentUser = securityUtils.getCurrentUser();
        return nodeService.createNode(input, currentUser);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Node updateNode(@Argument String id, @Argument UpdateNodeInput input) {
        return nodeService.updateNode(id, input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteNode(@Argument String id) {
        return nodeService.deleteNode(id);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Edge createEdge(@Argument CreateEdgeInput input) {
        User currentUser = securityUtils.getCurrentUser();
        return edgeService.createEdge(input, currentUser);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Edge updateEdge(@Argument String id, @Argument UpdateEdgeInput input) {
        return edgeService.updateEdge(id, input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteEdge(@Argument String id) {
        return edgeService.deleteEdge(id);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Board shareBoard(@Argument String boardId, @Argument String username, @Argument Permission permission) {
        return boardService.shareBoard(boardId, username, permission);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean updateCursor(@Argument String boardId, @Argument Double x, @Argument Double y) {
        User currentUser = securityUtils.getCurrentUser();
        
        CursorPosition position = CursorPosition.builder()
                .userId(currentUser.getId())
                .username(currentUser.getUsername())
                .x(x)
                .y(y)
                .timestamp(Instant.now().toString())
                .build();
        
        subscriptionService.publishCursorPosition(boardId, position);
        return true;
    }
}

