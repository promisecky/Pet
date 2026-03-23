package com.pethealth.service;

import com.pethealth.entity.Pet;
import com.pethealth.entity.WeightRecord;
import com.pethealth.repository.PetRepository;
import com.pethealth.repository.WeightRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class WeightService {

    @Autowired
    private WeightRecordRepository weightRecordRepository;

    @Autowired
    private PetRepository petRepository;

    public WeightRecord addWeightRecord(String petId, Double weight, Date date) {
        log.info("Adding weight record for pet: {}, weight: {}", petId, weight);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        // Check if a record already exists for this date (ignoring time if desired, but here we used Date object)
        // If we want to ensure only one record per day, we should query by date range or truncate time.
        // For simplicity, let's assume the controller passes a truncated date or we handle it here.
        // But for "update", let's check if there is a record for the same day.
        
        // Better approach: Check if record exists for this pet and this date (ignoring time)
        // Since we are using Date with TemporalType.DATE in entity, the time component might be truncated in DB anyway.
        // Let's try to find existing record first to update it instead of creating new one if it's the same day.
        
        List<WeightRecord> existing = weightRecordRepository.findByPetIdAndRecordDate(petId, date != null ? date : new Date());
        WeightRecord record;
        if (!existing.isEmpty()) {
            record = existing.get(0);
            record.setWeight(weight);
            log.info("Updating existing weight record: {}", record.getId());
        } else {
            record = new WeightRecord();
            record.setPet(pet);
            record.setWeight(weight);
            record.setRecordDate(date != null ? date : new Date());
            log.info("Creating new weight record");
        }
        
        // Update current weight in pet entity
        pet.setWeight(weight);
        petRepository.save(pet);
        
        return weightRecordRepository.save(record);
    }

    public List<WeightRecord> getRecentWeights(String petId) {
        // Get last 7 days
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        Date startDate = Date.from(sevenDaysAgo.atStartOfDay(ZoneId.systemDefault()).toInstant());
        
        return weightRecordRepository.findRecentWeights(petId, startDate);
    }
}
