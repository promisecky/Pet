package com.pethealth.controller;

import com.pethealth.entity.Task;
import com.pethealth.service.TaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@Slf4j
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<?> getTasks(@RequestParam("petId") String petId) {
        log.info("Received request to get tasks for pet: {}", petId);
        try {
            List<Task> tasks = taskService.getTasksForPet(petId);
            Map<String, Object> response = new HashMap<>();
            response.put("data", tasks);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting tasks: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateTaskStatus(@PathVariable String id, @RequestBody Map<String, Boolean> updates) {
        log.info("Received request to update task status: {}", id);
        try {
            Boolean completed = updates.get("completed");
            if (completed == null) {
                return ResponseEntity.badRequest().body("Missing 'completed' field");
            }
            Task updatedTask = taskService.updateTaskStatus(id, completed);
            Map<String, Object> response = new HashMap<>();
            response.put("data", updatedTask);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating task: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
