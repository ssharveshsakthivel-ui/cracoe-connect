package com.cracoe.connect.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
}
