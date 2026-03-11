const API_BASE = '/api'

// Mock implementation for frontend testing without backend
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      // Mock login for demo/testing
      console.log('Mock login with:', email, password);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              user: {
                id: 'mock-user-123',
                email: email,
                aud: 'authenticated',
                role: 'authenticated',
              },
              profile: {
                nickname: 'Test User',
                avatar_url: null
              }
            }
          });
        }, 800);
      });
    },
    register: async (email: string, password: string, nickname?: string) => {
      // Mock register
      console.log('Mock register with:', email, password, nickname);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              user: {
                id: 'mock-user-new',
                email: email,
              },
              profile: {
                nickname: nickname || 'New User',
              }
            }
          });
        }, 800);
      });
    }
  },
  pets: {
    list: async (userId: string) => {
      // Mock pets list
      console.log('Mock fetch pets for user:', userId);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 'pet-1',
                user_id: userId,
                name: '旺财',
                species: 'dog',
                breed: 'Golden Retriever',
                gender: 'male',
                birth_date: '2020-01-01',
                weight: 25,
                is_neutered: true,
                created_at: new Date().toISOString()
              },
              {
                id: 'pet-2',
                user_id: userId,
                name: '咪咪',
                species: 'cat',
                breed: 'British Shorthair',
                gender: 'female',
                birth_date: '2021-05-15',
                weight: 4.5,
                is_neutered: false,
                created_at: new Date().toISOString()
              }
            ]
          });
        }, 500);
      });
    },
    create: async (pet: any) => {
      // Mock create pet
      console.log('Mock create pet:', pet);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              ...pet,
              id: `pet-${Date.now()}`,
              created_at: new Date().toISOString()
            }
          });
        }, 800);
      });
    },
    update: async (id: string, updates: any) => {
      // Mock update pet
      console.log('Mock update pet:', id, updates);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id,
              ...updates,
              updated_at: new Date().toISOString()
            }
          });
        }, 600);
      });
    },
    delete: async (id: string) => {
      // Mock delete pet
      console.log('Mock delete pet:', id);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: true });
        }, 400);
      });
    }
  }
}
