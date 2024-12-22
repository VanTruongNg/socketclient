import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true
    }
  )
) 