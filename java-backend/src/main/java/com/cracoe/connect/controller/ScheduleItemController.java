package com.cracoe.connect.controller;
import com.cracoe.connect.entity.ScheduleItem;
import com.cracoe.connect.repository.ScheduleItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/scheduleitems")
@RequiredArgsConstructor
public class ScheduleItemController {
    private final ScheduleItemRepository repository;
    @GetMapping
    public List<ScheduleItem> getAll() {
        return repository.findAll();
    }
}
