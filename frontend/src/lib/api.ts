const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:8080/api'

const real = {
  async json<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Request failed: ${response.status}`)
    }
    return await response.json()
  }
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data: any = await real.json(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      return {
        data: {
          user: { id: data.user.id, email: data.user.email, aud: 'authenticated', role: 'authenticated' },
          profile: { nickname: data.user.nickname, avatar_url: null },
          token: data.token
        }
      }
    },
    register: async (email: string, password: string, nickname?: string) => {
      const data: any = await real.json(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      })
      return { data: { user: { id: data.id, email: data.email }, profile: { nickname: data.nickname } } }
    }
  },
  pets: {
    list: async (userId: string): Promise<{ data: any[] }> => {
      return await real.json(`${API_BASE}/pets?userId=${encodeURIComponent(userId)}`, { method: 'GET' })
    },
    create: async (pet: any): Promise<{ data: any }> => {
      return await real.json(`${API_BASE}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pet),
      })
    },
    update: async (idVal: string, updates: any) => {
      return await real.json(`${API_BASE}/pets/${encodeURIComponent(idVal)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    },
    delete: async (idVal: string) => {
      return await real.json(`${API_BASE}/pets/${encodeURIComponent(idVal)}`, { method: 'DELETE' })
    }
  },
  weights: {
    list: async (petId: string) => {
      return await real.json(`${API_BASE}/weights?petId=${encodeURIComponent(petId)}`, { method: 'GET' })
    },
    add: async (petId: string, weight: number) => {
      return await real.json(`${API_BASE}/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet_id: petId, weight }),
      })
    }
  },
  tasks: {
    list: async (petId: string) => {
      return await real.json(`${API_BASE}/tasks?petId=${encodeURIComponent(petId)}`, { method: 'GET' })
    },
    updateStatus: async (taskId: string, completed: boolean) => {
      return await real.json(`${API_BASE}/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
    }
  },
  healthPlans: {
    get: async (petId: string) => {
      return await real.json(`${API_BASE}/health-plans?petId=${encodeURIComponent(petId)}`, { method: 'GET' })
    },
    generate: async (petId: string, goalType: string, targetWeight?: number) => {
      return await real.json(`${API_BASE}/health-plans/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet_id: petId, goal_type: goalType, target_weight: targetWeight }),
      })
    },
    createOrUpdate: async (plan: any) => {
      return await real.json(`${API_BASE}/health-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      })
    }
  }
}
