package com.mindmap.controller;

import com.mindmap.model.Board;
import com.mindmap.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final BoardService boardService;

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/boards")
    public String boards() {
        return "boards";
    }

    @GetMapping("/board/{id}")
    public String board(@PathVariable String id, Model model) {
        try {
            Board board = boardService.getBoard(id);
            model.addAttribute("board", board);
            return "board";
        } catch (Exception e) {
            return "redirect:/boards";
        }
    }
}

