package com.cracoe.connect.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "scheduleitems")
public class ScheduleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
}
