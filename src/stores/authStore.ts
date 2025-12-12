import { create } from 'zustand'
import { AuthState, User } from '../types'
import { authService } from '../services/auth'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>()(
  (set, get) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          await authService.signIn(email, password)
          const user = await authService.getCurrentUser()
          set({ user, loading: false })
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          await authService.signOut()
          set({ user: null, loading: false, error: null })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      signUp: async (email: string, password: string, username: string) => {
        set({ loading: true, error: null })
        try {
          await authService.signUp(email, password, username)
          // 注册后需要验证邮箱，暂时不自动登录
          set({ loading: false })
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      checkAuth: async () => {
        set({ loading: true })
        try {
          const user = await authService.getCurrentUser()
          set({ user, loading: false })
        } catch (error) {
          set({ user: null, loading: false })
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },
    })
)