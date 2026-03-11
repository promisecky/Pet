import { create } from 'zustand'
import { Pet } from './types'

type User = {
  id: string
  name: string
  email: string
}

type Store = {
  user: User | null
  pets: Pet[]
  currentPetId: string | null
  
  // Actions
  login: (user: User) => void
  logout: () => void
  setPets: (pets: Pet[]) => void
  setCurrentPetId: (id: string) => void
  addPet: (pet: Pet) => void
  updatePet: (id: string, updates: Partial<Pet>) => void
  removePet: (id: string) => void
}

export const useStore = create<Store>((set) => ({
  user: null,
  pets: [],
  currentPetId: null,

  login: (user) => set({ user }),
  logout: () => set({ user: null, pets: [], currentPetId: null }),
  setPets: (pets) => set({ pets, currentPetId: pets.length > 0 ? pets[0].id : null }),
  setCurrentPetId: (id) => set({ currentPetId: id }),
  addPet: (pet) => set((state) => ({ 
    pets: [...state.pets, pet],
    currentPetId: state.pets.length === 0 ? pet.id : state.currentPetId
  })),
  updatePet: (id, updates) => set((state) => ({
    pets: state.pets.map(pet => pet.id === id ? { ...pet, ...updates } : pet)
  })),
  removePet: (id) => set((state) => ({
    pets: state.pets.filter(p => p.id !== id),
    currentPetId: state.currentPetId === id ? (state.pets.find(p => p.id !== id)?.id || null) : state.currentPetId
  }))
}))
