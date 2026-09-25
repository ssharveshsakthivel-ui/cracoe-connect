package com.cracoe.connect.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
}
