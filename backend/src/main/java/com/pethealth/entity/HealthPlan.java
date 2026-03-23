package com.pethealth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data
@Entity
@Table(name = "health_plans")
public class HealthPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    @JsonIgnore
    private Pet pet;

    @Column(name = "pet_id", insertable = false, updatable = false)
    private String petId;

    @Column(name = "goal_type", nullable = false)
    private String goalType; // lose_weight, gain_weight, maintain

    @Column(name = "target_weight")
    private Double targetWeight;

    @Column(name = "daily_calories")
    private Integer dailyCalories;

    @Column(name = "exercise_plan", length = 1000)
    private String exercisePlan;
    
    // Store feeding schedule as JSON string for simplicity in this demo
    @Column(name = "feeding_schedule", length = 2000)
    private String feedingSchedule; 

    @Column(nullable = false)
    private String status = "active"; // active, archived

    @Column(name = "start_date")
    @Temporal(TemporalType.DATE)
    private Date startDate;

    @Column(name = "end_date")
    @Temporal(TemporalType.DATE)
    private Date endDate;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        if (startDate == null) {
            startDate = new Date();
        }
    }
}
