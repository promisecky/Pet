package com.pethealth.controller;

import com.pethealth.entity.Pet;
import com.pethealth.service.PetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "*")
@Slf4j
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping
    public ResponseEntity<?> listPets(@RequestParam("userId") String userId) {
        log.info("Received request to list pets for user: {}", userId);
        try {
            List<Pet> pets = petService.getPetsByUserId(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("data", pets);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error listing pets: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createPet(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("user_id");
        log.info("Received request to create pet for user: {}", userId);
        try {
            Pet pet = new Pet();
            pet.setName((String) request.get("name"));
            pet.setSpecies((String) request.get("species"));
            pet.setBreed((String) request.get("breed"));
            pet.setGender((String) request.get("gender"));
            
            if (request.get("birth_date") != null) {
                pet.setBirthDate((String) request.get("birth_date"));
            }
            
            if (request.get("weight") != null) {
                pet.setWeight(Double.valueOf(request.get("weight").toString()));
            }
            if (request.get("is_neutered") != null) {
                pet.setIsNeutered((Boolean) request.get("is_neutered"));
            }
            if (request.get("avatar_url") != null) {
                String avatarUrl = (String) request.get("avatar_url");
                // Check if it's a base64 string
                if (avatarUrl.startsWith("data:image")) {
                     log.warn("Avatar is base64, too long for varchar(255). Ignoring for now.");
                     // In a real app, we should upload this to S3/Cloud storage and save the URL
                     // Or change DB column to LONGTEXT. 
                     // For this demo, we'll just set it to null to avoid the error.
                     pet.setAvatarUrl(null);
                } else if (avatarUrl.length() <= 255) {
                    pet.setAvatarUrl(avatarUrl);
                } else {
                    log.warn("Avatar URL too long (>255 chars). Ignoring.");
                    pet.setAvatarUrl(null);
                }
            }

            Pet createdPet = petService.createPet(userId, pet);
            Map<String, Object> response = new HashMap<>();
            response.put("data", createdPet);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating pet: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePet(@PathVariable String id, @RequestBody Map<String, Object> request) {
        log.info("Received request to update pet: {}", id);
        try {
            Pet petUpdates = new Pet();
            if (request.containsKey("name")) petUpdates.setName((String) request.get("name"));
            if (request.containsKey("species")) petUpdates.setSpecies((String) request.get("species"));
            if (request.containsKey("breed")) petUpdates.setBreed((String) request.get("breed"));
            if (request.containsKey("gender")) petUpdates.setGender((String) request.get("gender"));
            if (request.containsKey("birth_date")) petUpdates.setBirthDate((String) request.get("birth_date"));
            if (request.containsKey("weight")) petUpdates.setWeight(Double.valueOf(request.get("weight").toString()));
            if (request.containsKey("is_neutered")) petUpdates.setIsNeutered((Boolean) request.get("is_neutered"));
            if (request.containsKey("avatar_url")) petUpdates.setAvatarUrl((String) request.get("avatar_url"));
            if (request.containsKey("status")) petUpdates.setStatus((String) request.get("status"));

            Pet updatedPet = petService.updatePet(id, petUpdates);
            Map<String, Object> response = new HashMap<>();
            response.put("data", updatedPet);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating pet: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable String id) {
        log.info("Received request to delete pet: {}", id);
        try {
            petService.deletePet(id);
            return ResponseEntity.ok().body(Map.of("data", true));
        } catch (Exception e) {
            log.error("Error deleting pet: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
