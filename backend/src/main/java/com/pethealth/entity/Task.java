package com.pethealth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    @JsonIgnore
    private Pet pet;

    @Column(name = "pet_id", insertable = false, updatable = false)
    private String petId;

    @Column(nullable = false)
    private String title;

    private String detail;
    private String icon; // "utensils", "droplets", "activity", "sparkles"
    private String color; // "orange", "blue", "green", "purple"
    
    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "task_date")
    @Temporal(TemporalType.DATE)
    private Date taskDate; // To track daily tasks

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        if (taskDate == null) {
            taskDate = new Date();
        }
        if (completed == null) {
            completed = false;
        }
    }
}
