package com.cracoe.connect.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
}
