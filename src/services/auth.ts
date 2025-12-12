import { supabase } from './supabase'
import { emergencyAuthService } from './auth_emergency'
import { User } from '../types'

export const authService = {
  // 注册
  async signUp(email: string, password: string, username: string) {
    console.log('开始注册:', { email, username })
    
    try {
      // 首先尝试 Supabase 注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })

      if (error) {
        console.error('Supabase 注册错误:', error.message)
        
        // 如果是数据库错误，自动切换到紧急模式
        if (error.message === 'Database error saving new user' || error.status === 500) {
          console.log('Supabase 注册失败，切换到紧急注册模式')
          
          try {
            const emergencyUser = await emergencyAuthService.signUp(email, password, username)
            
            // 启用紧急模式
            ;(emergencyAuthService as any).constructor.enableEmergencyMode()
            
            throw new Error('注册成功！由于系统维护，当前使用临时登录模式。请直接登录。')
          } catch (emergencyError: any) {
            throw new Error(emergencyError.message || '紧急注册失败')
          }
        }
        
        throw error
      }

      console.log('Supabase 注册成功:', data)
      return data
      
    } catch (error: any) {
      console.error('注册过程中发生错误:', error)
      throw error
    }
  },

  // 登录
  async signIn(email: string, password: string) {
    // 如果是紧急模式，使用紧急登录
    if ((emergencyAuthService as any).constructor.isEmergencyMode()) {
      console.log('使用紧急登录模式')
      const user = await emergencyAuthService.signIn(email, password)
      emergencyAuthService.setCurrentUser(email)
      return { user: { id: user.id, email: user.email }, session: { user: { id: user.id } } }
    }

    // 尝试 Supabase 登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase 登录失败:', error.message)
      throw error
    }
    
    return data
  },

  // 登出
  async signOut() {
    // 如果是紧急模式，使用紧急登出
    if ((emergencyAuthService as any).constructor.isEmergencyMode()) {
      console.log('使用紧急登出模式')
      await emergencyAuthService.signOut()
      return
    }

    // Supabase 模式
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    // 如果是紧急模式，从紧急存储获取用户
    if ((emergencyAuthService as any).constructor.isEmergencyMode()) {
      console.log('使用紧急模式获取当前用户')
      const emergencyUser = await emergencyAuthService.getCurrentUser()
      if (!emergencyUser) return null
      
      return {
        id: emergencyUser.id,
        email: emergencyUser.email,
        username: emergencyUser.username,
        coins: emergencyUser.coins,
        exp: emergencyUser.exp,
        created_at: emergencyUser.created_at
      } as User
    }

    // Supabase 模式
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      return profile as User
    } catch (e) {
      console.error('获取用户资料失败:', e)
      return {
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || 'Unknown',
        coins: 0,
        exp: 0,
        created_at: user.created_at || new Date().toISOString()
      } as User
    }
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        callback(profile.data as User)
      } else {
        callback(null)
      }
    })
  },
}