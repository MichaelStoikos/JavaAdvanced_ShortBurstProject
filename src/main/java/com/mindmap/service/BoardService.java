package com.mindmap.service;

import com.mindmap.graphql.input.CreateBoardInput;
import com.mindmap.graphql.input.UpdateBoardInput;
import com.mindmap.model.*;
import com.mindmap.repository.BoardRepository;
import com.mindmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final NodeService nodeService;
    private final EdgeService edgeService;

    public List<Board> getUserBoards(String userId) {
        List<Board> ownedBoards = boardRepository.findByOwnerId(userId);
        List<Board> sharedBoards = boardRepository.findByCollaboratorsUserId(userId);
        
        return Stream.concat(ownedBoards.stream(), sharedBoards.stream())
                .distinct()
                .toList();
    }

    public Board getBoard(String id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));
    }

    public Board createBoard(CreateBoardInput input, User owner) {
        Board board = Board.builder()
                .title(input.getTitle())
                .description(input.getDescription())
                .owner(owner)
                .collaborators(new ArrayList<>())
                .build();
        
        return boardRepository.save(board);
    }

    public Board updateBoard(String id, UpdateBoardInput input) {
        Board board = getBoard(id);
        
        if (input.getTitle() != null) {
            board.setTitle(input.getTitle());
        }
        if (input.getDescription() != null) {
            board.setDescription(input.getDescription());
        }
        
        return boardRepository.save(board);
    }

    @Transactional
    public Boolean deleteBoard(String id) {
        Board board = getBoard(id);
        
        // Delete all nodes and edges associated with this board
        nodeService.deleteNodesByBoardId(id);
        edgeService.deleteEdgesByBoardId(id);
        
        boardRepository.delete(board);
        return true;
    }

    public Board shareBoard(String boardId, String username, Permission permission) {
        Board board = getBoard(boardId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is already a collaborator
        boolean exists = board.getCollaborators().stream()
                .anyMatch(c -> c.getUser().getId().equals(user.getId()));
        
        if (!exists) {
            Collaborator collaborator = Collaborator.builder()
                    .user(user)
                    .permission(permission)
                    .build();
            board.getCollaborators().add(collaborator);
        } else {
            // Update permission if already exists
            board.getCollaborators().stream()
                    .filter(c -> c.getUser().getId().equals(user.getId()))
                    .findFirst()
                    .ifPresent(c -> c.setPermission(permission));
        }
        
        return boardRepository.save(board);
    }
}

