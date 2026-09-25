package com.cracoe.connect.controller;
import com.cracoe.connect.entity.Announcement;
import com.cracoe.connect.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {
    private final AnnouncementRepository repository;
    @GetMapping
    public List<Announcement> getAll() {
        return repository.findAll();
    }
}
