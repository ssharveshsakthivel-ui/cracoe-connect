package com.cracoe.connect.controller;
import com.cracoe.connect.entity.Message;
import com.cracoe.connect.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageRepository repository;
    @GetMapping
    public List<Message> getAll() {
        return repository.findAll();
    }
}
