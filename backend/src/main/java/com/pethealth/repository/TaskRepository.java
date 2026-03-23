package com.pethealth.repository;

import com.pethealth.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Date;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByPetIdAndTaskDate(String petId, Date taskDate);
    
    List<Task> findByPetIdAndTaskDateGreaterThanEqualOrderByTaskDateDesc(String petId, Date startDate);
    
    // Find template tasks (e.g., tasks with null taskDate or special flag if we want recurring tasks)
    // For simplicity, we'll just create new tasks for each day if they don't exist
}
