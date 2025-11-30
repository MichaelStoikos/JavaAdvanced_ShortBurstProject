package com.mindmap.repository;

import com.mindmap.model.Node;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends MongoRepository<Node, String> {
    
    List<Node> findByBoardId(String boardId);
    
    void deleteByBoardId(String boardId);
}

