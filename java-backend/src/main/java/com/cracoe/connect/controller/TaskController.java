package com.cracoe.connect.controller;
import com.cracoe.connect.entity.Task;
import com.cracoe.connect.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskRepository repository;
    @GetMapping
    public List<Task> getAll() {
        return repository.findAll();
    }
}
