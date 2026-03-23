package com.pethealth.service;

import com.pethealth.entity.Pet;
import com.pethealth.entity.User;
import com.pethealth.repository.PetRepository;
import com.pethealth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Pet> getPetsByUserId(String userId) {
        log.info("Fetching pets for user: {}", userId);
        return petRepository.findByUserId(userId);
    }

    public Pet createPet(String userId, Pet pet) {
        log.info("Creating pet for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        pet.setUser(user);
        return petRepository.save(pet);
    }

    public Pet updatePet(String petId, Pet petUpdates) {
        log.info("Updating pet: {}", petId);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (petUpdates.getName() != null) pet.setName(petUpdates.getName());
        if (petUpdates.getSpecies() != null) pet.setSpecies(petUpdates.getSpecies());
        if (petUpdates.getBreed() != null) pet.setBreed(petUpdates.getBreed());
        if (petUpdates.getGender() != null) pet.setGender(petUpdates.getGender());
        if (petUpdates.getBirthDate() != null) pet.setBirthDate(petUpdates.getBirthDate());
        if (petUpdates.getWeight() != null) pet.setWeight(petUpdates.getWeight());
        if (petUpdates.getIsNeutered() != null) pet.setIsNeutered(petUpdates.getIsNeutered());
        if (petUpdates.getAvatarUrl() != null) pet.setAvatarUrl(petUpdates.getAvatarUrl());
        if (petUpdates.getStatus() != null) pet.setStatus(petUpdates.getStatus());

        return petRepository.save(pet);
    }

    public void deletePet(String petId) {
        log.info("Deleting pet: {}", petId);
        petRepository.deleteById(petId);
    }
}
