package com.pethealth.repository;

import com.pethealth.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PetRepository extends JpaRepository<Pet, String> {
    List<Pet> findByUserId(String userId);
}
