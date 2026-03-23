export type Pet = {
  id: string
  user_id: string
  name: string
  species: 'cat' | 'dog'
  breed?: string
  gender?: 'male' | 'female'
  birth_date?: string
  weight?: number
  is_neutered: boolean
  medical_history?: string
  avatar_url?: string
  status?: string
  created_at: string
}

export type HealthPlan = {
  id: string
  pet_id: string
  goal_type: 'lose_weight' | 'gain_weight' | 'maintain'
  target_weight: number
  daily_calories: number
  feeding_schedule: { time: string; amount_g: number }[]
  exercise_plan: string
  status: 'active' | 'archived'
  start_date: string
  end_date?: string
  created_at: string
}

export type DailyLog = {
  id: string
  pet_id: string
  date: string
  weight?: number
  food_intake?: number
  water_intake?: number
  exercise_minutes?: number
  notes?: string
  created_at: string
}

export type Device = {
  id: string
  user_id: string
  name?: string
  type: 'feeder' | 'waterer'
  status: 'online' | 'offline' | 'error'
  last_active?: string
  config?: any
  created_at: string
}

export type Task = {
  id: string
  pet_id: string
  title: string
  detail: string
  icon: string
  color: string
  completed: boolean
  task_date?: string
  created_at?: string
}
