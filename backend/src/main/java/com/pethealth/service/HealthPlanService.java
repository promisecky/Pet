package com.pethealth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pethealth.entity.HealthPlan;
import com.pethealth.entity.Pet;
import com.pethealth.entity.Task;
import com.pethealth.entity.WeightRecord;
import com.pethealth.repository.HealthPlanRepository;
import com.pethealth.repository.PetRepository;
import com.pethealth.repository.TaskRepository;
import com.pethealth.repository.WeightRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.common.ResponseFormat;

import java.util.*;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@Slf4j
public class HealthPlanService {

    @Autowired
    private HealthPlanRepository healthPlanRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private WeightRecordRepository weightRecordRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Value("${ai.dashscope.api-key:sk-4e504f447a2a403abb8232ba4ac4d5b7}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public HealthPlan getActivePlan(String petId) {
        return healthPlanRepository.findByPetIdAndStatus(petId, "active")
                .orElse(null);
    }

    public HealthPlan createOrUpdatePlan(String petId, Map<String, Object> planData) {
        log.info("Creating/Updating plan for pet: {}", petId);
        
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // Check if there is already an active plan
        HealthPlan existingPlan = healthPlanRepository.findByPetIdAndStatus(petId, "active").orElse(null);
        
        HealthPlan plan;
        if (existingPlan != null) {
            plan = existingPlan; // Update existing
            log.info("Updating existing active plan: {}", plan.getId());
        } else {
            plan = new HealthPlan(); // Create new
            plan.setPet(pet);
            plan.setStatus("active");
            log.info("Creating new plan");
        }

        if (planData.containsKey("goal_type")) plan.setGoalType((String) planData.get("goal_type"));
        if (planData.containsKey("target_weight")) {
            plan.setTargetWeight(Double.valueOf(planData.get("target_weight").toString()));
        }
        if (planData.containsKey("daily_calories")) {
            plan.setDailyCalories(Integer.valueOf(planData.get("daily_calories").toString()));
        }
        if (planData.containsKey("exercise_plan")) plan.setExercisePlan((String) planData.get("exercise_plan"));
        
        // Handle feeding schedule list -> JSON string
        if (planData.containsKey("feeding_schedule")) {
            try {
                String scheduleJson = objectMapper.writeValueAsString(planData.get("feeding_schedule"));
                plan.setFeedingSchedule(scheduleJson);
            } catch (Exception e) {
                log.error("Error serializing feeding schedule", e);
            }
        }

        HealthPlan savedPlan = healthPlanRepository.save(plan);

        // Generate default tasks if provided
        if (planData.containsKey("tasks")) {
            try {
                List<Map<String, Object>> tasks = (List<Map<String, Object>>) planData.get("tasks");
                // Clear old tasks for today or just delete all incomplete tasks?
                // Let's delete incomplete tasks for today
                Date today = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
                List<Task> existingTasks = taskRepository.findByPetIdAndTaskDate(petId, today);
                for (Task t : existingTasks) {
                    if (!t.getCompleted()) {
                        taskRepository.delete(t);
                    }
                }

                for (Map<String, Object> taskData : tasks) {
                    Task newTask = new Task();
                    newTask.setPet(pet);
                    newTask.setTitle((String) taskData.get("title"));
                    newTask.setDetail((String) taskData.get("detail"));
                    newTask.setIcon((String) taskData.getOrDefault("icon", "activity"));
                    newTask.setColor((String) taskData.getOrDefault("color", "green"));
                    newTask.setTaskDate(today);
                    taskRepository.save(newTask);
                }
            } catch (Exception e) {
                log.error("Error saving generated tasks", e);
            }
        }

        return savedPlan;
    }

    public HealthPlan generateAiPlan(String petId, String goalType, Double targetWeight) {
        Pet pet = petRepository.findById(petId).orElseThrow(() -> new RuntimeException("Pet not found"));

        Date sevenDaysAgo = Date.from(LocalDate.now().minusDays(7).atStartOfDay(ZoneId.systemDefault()).toInstant());
        List<WeightRecord> weights = weightRecordRepository.findRecentWeights(petId, sevenDaysAgo);
        List<Task> tasks = taskRepository.findByPetIdAndTaskDateGreaterThanEqualOrderByTaskDateDesc(petId, sevenDaysAgo);

        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位专业的宠物健康营养师。请为我的宠物制定一份健康计划，以JSON格式返回。\n");
        prompt.append("宠物信息：\n");
        prompt.append("- 名字：").append(pet.getName()).append("\n");
        prompt.append("- 物种：").append("cat".equals(pet.getSpecies()) ? "猫" : "狗").append("\n");
        prompt.append("- 品种：").append(pet.getBreed() != null ? pet.getBreed() : "未知").append("\n");
        prompt.append("- 性别：").append("female".equals(pet.getGender()) ? "母" : "公").append("\n");
        prompt.append("- 是否绝育：").append(Boolean.TRUE.equals(pet.getIsNeutered()) ? "是" : "否").append("\n");
        prompt.append("- 当前体重：").append(pet.getWeight()).append(" kg\n");
        prompt.append("- 目标类型：").append("lose".equals(goalType) ? "减重" : "gain".equals(goalType) ? "增重" : "保持健康").append("\n");
        if (targetWeight != null) {
            prompt.append("- 目标体重：").append(targetWeight).append(" kg\n");
        }

        if (!weights.isEmpty()) {
            prompt.append("最近7天体重记录：\n");
            for (WeightRecord w : weights) {
                prompt.append("- ").append(w.getRecordDate()).append(": ").append(w.getWeight()).append(" kg\n");
            }
        }

        if (!tasks.isEmpty()) {
            prompt.append("最近7天饮食与活动记录：\n");
            for (Task t : tasks) {
                prompt.append("- ").append(t.getTaskDate()).append(" [").append(t.getTitle()).append("] ").append(t.getDetail()).append("\n");
            }
        }

        prompt.append("\n请返回标准的 JSON 格式数据。JSON 结构如下：\n");
        prompt.append("{\n");
        prompt.append("  \"daily_calories\": 250,\n");
        prompt.append("  \"feeding_schedule\": [\n");
        prompt.append("    { \"time\": \"08:00\", \"amount\": \"50g\", \"type\": \"干粮\" }\n");
        prompt.append("  ],\n");
        prompt.append("  \"exercise_plan\": \"具体的运动建议\",\n");
        prompt.append("  \"tasks\": [\n");
        prompt.append("    { \"title\": \"任务标题\", \"detail\": \"任务详情\", \"icon\": \"activity/utensils/droplets/sparkles\", \"color\": \"green/orange/blue/purple\" }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\n要求：\n");
        prompt.append("1. tasks 数组中必须包含**至少 4 个今日任务**（例如：喂食、运动互动、加水、护理等）。\n");
        prompt.append("2. 喂食计划 (feeding_schedule) 必须与生成的喂食任务 (tasks) 在时间上相对应。\n");
        prompt.append("3. 运动建议 (exercise_plan) 必须体现在至少一个互动玩耍的 task 中。\n");

        log.info("Sending prompt to AI: \n{}", prompt);

        try {
            Generation gen = new Generation();
            Message systemMsg = Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content("你是一个专业的宠物健康顾问，必须以严格的 JSON 格式输出结果。")
                    .build();
            Message userMsg = Message.builder()
                    .role(Role.USER.getValue())
                    .content(prompt.toString())
                    .build();
            
            ResponseFormat jsonMode = ResponseFormat.builder().type("json_object").build();
            
            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model("qwen-plus")
                    .messages(Arrays.asList(systemMsg, userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .responseFormat(jsonMode)
                    .build();

            GenerationResult result = gen.call(param);
            String aiContent = result.getOutput().getChoices().get(0).getMessage().getContent();
            
            log.info("AI Response: {}", aiContent);
            
            Map<String, Object> planData = objectMapper.readValue(aiContent, Map.class);
            planData.put("goal_type", goalType);
            if (targetWeight != null) {
                planData.put("target_weight", targetWeight);
            }

            return createOrUpdatePlan(petId, planData);
        } catch (Exception e) {
            log.error("Failed to generate AI plan", e);
            throw new RuntimeException("生成计划失败，请重试");
        }
    }
}
