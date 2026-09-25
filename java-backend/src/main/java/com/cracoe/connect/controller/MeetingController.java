package com.cracoe.connect.controller;
import com.cracoe.connect.entity.Meeting;
import com.cracoe.connect.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {
    private final MeetingRepository repository;
    @GetMapping
    public List<Meeting> getAll() {
        return repository.findAll();
    }
}
