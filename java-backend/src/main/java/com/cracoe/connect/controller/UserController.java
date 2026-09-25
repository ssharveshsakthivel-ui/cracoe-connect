package com.cracoe.connect.controller;
import com.cracoe.connect.entity.User;
import com.cracoe.connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository repository;
    @GetMapping
    public List<User> getAll() {
        return repository.findAll();
    }
}
