import { create } from 'zustand'
import { Pet, Task } from './types'

type User = {
  id: string
  name: string
  email: string
}

type Store = {
  user: User | null
  pets: Pet[]
  currentPetId: string | null
  tasks: Task[]
  
  // Actions
  login: (user: User) => void
  logout: () => void
  setPets: (pets: Pet[]) => void
  setCurrentPetId: (id: string) => void
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
  addPet: (pet: Pet) => void
  updatePet: (id: string, updates: Partial<Pet>) => void
  removePet: (id: string) => void
}

export const useStore = create<Store>((set) => ({
  user: null,
  pets: [],
  currentPetId: null,
  tasks: [],

  login: (user) => set({ user }),
  logout: () => set({ user: null, pets: [], currentPetId: null, tasks: [] }),
  setPets: (pets) => set((state) => ({ 
    pets, 
    currentPetId: state.currentPetId || (pets.length > 0 ? pets[0].id : null) 
  })),
  setCurrentPetId: (id) => set({ currentPetId: id }),
  setTasks: (tasksOrUpdater) => set((state) => ({ 
    tasks: typeof tasksOrUpdater === 'function' ? tasksOrUpdater(state.tasks) : tasksOrUpdater 
  })),
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
