package com.pethealth.controller;

import com.pethealth.entity.WeightRecord;
import com.pethealth.service.WeightService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weights")
@CrossOrigin(origins = "*")
@Slf4j
public class WeightController {

    @Autowired
    private WeightService weightService;

    @GetMapping
    public ResponseEntity<?> getRecentWeights(@RequestParam("petId") String petId) {
        log.info("Received request to get weights for pet: {}", petId);
        try {
            List<WeightRecord> records = weightService.getRecentWeights(petId);
            Map<String, Object> response = new HashMap<>();
            response.put("data", records);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting weights: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> addWeight(@RequestBody Map<String, Object> request) {
        String petId = (String) request.get("pet_id");
        Double weight = Double.valueOf(request.get("weight").toString());
        // Simple date handling, assuming current date if not provided or parsing string if needed
        // For simplicity using new Date() for now if not provided
        Date date = new Date(); 
        
        log.info("Received request to add weight for pet: {}", petId);
        try {
            WeightRecord record = weightService.addWeightRecord(petId, weight, date);
            Map<String, Object> response = new HashMap<>();
            response.put("data", record);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error adding weight: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
