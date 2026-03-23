package com.pethealth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pethealth.entity.HealthPlan;
import com.pethealth.service.HealthPlanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health-plans")
@CrossOrigin(origins = "*")
@Slf4j
public class HealthPlanController {

    @Autowired
    private HealthPlanService healthPlanService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<?> getPlan(@RequestParam("petId") String petId) {
        log.info("Received request to get health plan for pet: {}", petId);
        try {
            HealthPlan plan = healthPlanService.getActivePlan(petId);
            
            if (plan == null) {
                return ResponseEntity.ok(Map.of("data", null)); // No plan found
            }
            
            // Convert JSON string back to object for response
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> planData = new HashMap<>();
            
            planData.put("id", plan.getId());
            planData.put("pet_id", plan.getPetId());
            planData.put("goal_type", plan.getGoalType());
            planData.put("target_weight", plan.getTargetWeight());
            planData.put("daily_calories", plan.getDailyCalories());
            planData.put("exercise_plan", plan.getExercisePlan());
            planData.put("status", plan.getStatus());
            planData.put("start_date", plan.getStartDate());
            planData.put("created_at", plan.getCreatedAt());

            if (plan.getFeedingSchedule() != null) {
                try {
                    Object schedule = objectMapper.readValue(plan.getFeedingSchedule(), Object.class);
                    planData.put("feeding_schedule", schedule);
                } catch (Exception e) {
                    log.error("Error deserializing feeding schedule", e);
                    planData.put("feeding_schedule", null);
                }
            }

            response.put("data", planData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting health plan: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generatePlan(@RequestBody Map<String, Object> request) {
        String petId = (String) request.get("pet_id");
        String goalType = (String) request.get("goal_type");
        Double targetWeight = null;
        if (request.get("target_weight") != null) {
            try {
                targetWeight = Double.valueOf(request.get("target_weight").toString());
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        log.info("Received request to generate health plan for pet: {}", petId);
        
        try {
            HealthPlan plan = healthPlanService.generateAiPlan(petId, goalType, targetWeight);
            return ResponseEntity.ok(Map.of("data", plan));
        } catch (Exception e) {
            log.error("Error generating health plan: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdatePlan(@RequestBody Map<String, Object> request) {
        String petId = (String) request.get("pet_id");
        log.info("Received request to create/update health plan for pet: {}", petId);
        
        try {
            HealthPlan plan = healthPlanService.createOrUpdatePlan(petId, request);
            return ResponseEntity.ok(Map.of("data", plan));
        } catch (Exception e) {
            log.error("Error saving health plan: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
