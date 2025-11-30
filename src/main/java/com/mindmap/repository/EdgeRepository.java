package com.mindmap.repository;

import com.mindmap.model.Edge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EdgeRepository extends MongoRepository<Edge, String> {
    
    List<Edge> findByBoardId(String boardId);
    
    void deleteByBoardId(String boardId);
    
    void deleteBySourceOrTarget(String source, String target);
}

