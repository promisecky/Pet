package com.pethealth.repository;

import com.pethealth.entity.HealthPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HealthPlanRepository extends JpaRepository<HealthPlan, String> {
    Optional<HealthPlan> findByPetIdAndStatus(String petId, String status);
    Optional<HealthPlan> findTopByPetIdOrderByCreatedAtDesc(String petId);
}
