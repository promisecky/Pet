package com.pethealth.repository;

import com.pethealth.entity.WeightRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface WeightRecordRepository extends JpaRepository<WeightRecord, String> {
    List<WeightRecord> findByPetIdOrderByRecordDateDesc(String petId);
    
    @Query("SELECT w FROM WeightRecord w WHERE w.petId = :petId AND w.recordDate >= :startDate ORDER BY w.recordDate ASC")
    List<WeightRecord> findRecentWeights(@Param("petId") String petId, @Param("startDate") Date startDate);

    List<WeightRecord> findByPetIdAndRecordDate(String petId, Date recordDate);
}
