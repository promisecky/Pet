package com.pethealth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pethealth.entity.HealthPlan;
import com.pethealth.entity.Pet;
import com.pethealth.entity.Task;
import com.pethealth.repository.HealthPlanRepository;
import com.pethealth.repository.PetRepository;
import com.pethealth.repository.TaskRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@Slf4j
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private HealthPlanRepository healthPlanRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Task> getTasksForPet(String petId) {
        // Use today's date (ignoring time)
        Date today = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
        
        List<Task> tasks = taskRepository.findByPetIdAndTaskDate(petId, today);
        
        if (tasks.isEmpty()) {
            // Generate tasks for today if none exist
            log.info("Generating tasks for pet: {} on {}", petId, today);
            tasks = generateTasksFromPlan(petId, today);
        }
        
        return tasks;
    }

    public Task updateTaskStatus(String taskId, boolean completed) {
        log.info("Updating task status: {} -> {}", taskId, completed);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setCompleted(completed);
        return taskRepository.save(task);
    }

    private List<Task> generateTasksFromPlan(String petId, Date date) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        List<Task> tasks = new ArrayList<>();
        
        // Check for active health plan
        HealthPlan plan = healthPlanRepository.findByPetIdAndStatus(petId, "active").orElse(null);

        if (plan != null && plan.getFeedingSchedule() != null) {
            log.info("Generating tasks from health plan for pet: {}", petId);
            try {
                List<Map<String, Object>> schedule = objectMapper.readValue(plan.getFeedingSchedule(), new TypeReference<List<Map<String, Object>>>(){});
                
                for (Map<String, Object> item : schedule) {
                    Task task = new Task();
                    task.setPet(pet);
                    String time = (String) item.get("time");
                    String amount = (String) item.get("amount");
                    String type = (String) item.get("type");
                    
                    // Simple logic to determine meal name based on time
                    String mealName = "喂食";
                    int hour = Integer.parseInt(time.split(":")[0]);
                    if (hour < 10) mealName = "早餐喂食";
                    else if (hour < 15) mealName = "午餐喂食";
                    else mealName = "晚餐喂食";

                    task.setTitle(mealName);
                    task.setDetail(time + " • " + amount + " " + type);
                    task.setIcon("utensils");
                    task.setColor("orange");
                    task.setTaskDate(date);
                    tasks.add(task);
                }
                
                // Add Exercise Task
                Task exercise = new Task();
                exercise.setPet(pet);
                exercise.setTitle("运动/互动");
                exercise.setDetail(plan.getExercisePlan());
                exercise.setIcon("activity");
                exercise.setColor("green");
                exercise.setTaskDate(date);
                tasks.add(exercise);

            } catch (Exception e) {
                log.error("Error parsing feeding schedule from plan", e);
                // Fallback to defaults if parsing fails
                return generateDefaultTasks(petId, date);
            }
        } else {
            log.info("No active plan found, using defaults for pet: {}", petId);
            return generateDefaultTasks(petId, date);
        }
        
        // Add common daily tasks that might not be in the plan
        Task water = new Task();
        water.setPet(pet);
        water.setTitle("加水");
        water.setDetail("保持水源新鲜");
        water.setIcon("droplets");
        water.setColor("blue");
        water.setTaskDate(date);
        tasks.add(water);
        
        Task grooming = new Task();
        grooming.setPet(pet);
        grooming.setTitle("梳毛护理");
        grooming.setDetail("全身梳理5分钟");
        grooming.setIcon("sparkles");
        grooming.setColor("purple");
        grooming.setTaskDate(date);
        tasks.add(grooming);

        return taskRepository.saveAll(tasks);
    }

    private List<Task> generateDefaultTasks(String petId, Date date) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        List<Task> defaultTasks = new ArrayList<>();
        
        // Task 1: Breakfast
        Task t1 = new Task();
        t1.setPet(pet);
        t1.setTitle("早餐喂食");
        t1.setDetail("08:00 AM • 50克");
        t1.setIcon("utensils");
        t1.setColor("orange");
        t1.setTaskDate(date);
        defaultTasks.add(t1);

        // Task 2: Water
        Task t2 = new Task();
        t2.setPet(pet);
        t2.setTitle("加水");
        t2.setDetail("保持水源新鲜");
        t2.setIcon("droplets");
        t2.setColor("blue");
        t2.setTaskDate(date);
        defaultTasks.add(t2);

        // Task 3: Play
        Task t3 = new Task();
        t3.setPet(pet);
        t3.setTitle("互动玩耍");
        t3.setDetail("20分钟 激光笔互动");
        t3.setIcon("activity");
        t3.setColor("green");
        t3.setTaskDate(date);
        defaultTasks.add(t3);

        // Task 4: Lunch
        Task t4 = new Task();
        t4.setPet(pet);
        t4.setTitle("午餐喂食");
        t4.setDetail("13:00 PM • 30克");
        t4.setIcon("utensils");
        t4.setColor("orange");
        t4.setTaskDate(date);
        defaultTasks.add(t4);
        
        // Task 5: Grooming
        Task t5 = new Task();
        t5.setPet(pet);
        t5.setTitle("梳毛护理");
        t5.setDetail("全身梳理5分钟");
        t5.setIcon("sparkles");
        t5.setColor("purple");
        t5.setTaskDate(date);
        defaultTasks.add(t5);

        // Task 6: Dinner
        Task t6 = new Task();
        t6.setPet(pet);
        t6.setTitle("晚餐喂食");
        t6.setDetail("19:00 PM • 40克");
        t6.setIcon("utensils");
        t6.setColor("orange");
        t6.setTaskDate(date);
        defaultTasks.add(t6);

        return taskRepository.saveAll(defaultTasks);
    }
}
