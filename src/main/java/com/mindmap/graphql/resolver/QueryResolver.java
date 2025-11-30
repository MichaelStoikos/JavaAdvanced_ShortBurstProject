package com.mindmap.graphql.resolver;

import com.mindmap.model.Board;
import com.mindmap.model.Edge;
import com.mindmap.model.Node;
import com.mindmap.model.User;
import com.mindmap.service.BoardService;
import com.mindmap.service.EdgeService;
import com.mindmap.service.NodeService;
import com.mindmap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class QueryResolver {

    private final BoardService boardService;
    private final NodeService nodeService;
    private final EdgeService edgeService;
    private final SecurityUtils securityUtils;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Board> myBoards() {
        User currentUser = securityUtils.getCurrentUser();
        return boardService.getUserBoards(currentUser.getId());
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Board board(@Argument String id) {
        return boardService.getBoard(id);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Node> nodes(@Argument String boardId) {
        return nodeService.getNodesByBoardId(boardId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Edge> edges(@Argument String boardId) {
        return edgeService.getEdgesByBoardId(boardId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public User me() {
        return securityUtils.getCurrentUser();
    }
}

