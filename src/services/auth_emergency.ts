// 紧急注册服务 - 绕过 Supabase 认证问题
import { supabase } from './supabase'

interface EmergencyUser {
  id: string
  email: string
  username: string
  password: string // 注意：实际应用中不应该明文存储密码
  coins: number
  exp: number
  created_at: string
}

// 模拟的用户数据库（存储在 localStorage 中）
const EMERGENCY_USERS_KEY = 'emergency_users'

class EmergencyAuthService {
  private getUsers(): EmergencyUser[] {
    const stored = localStorage.getItem(EMERGENCY_USERS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  private saveUsers(users: EmergencyUser[]): void {
    localStorage.setItem(EMERGENCY_USERS_KEY, JSON.stringify(users))
  }

  async signUp(email: string, password: string, username: string): Promise<EmergencyUser> {
    console.log('使用紧急注册服务:', { email, username })
    
    const users = this.getUsers()
    
    // 检查邮箱是否已存在
    if (users.find(u => u.email === email)) {
      throw new Error('该邮箱已被注册')
    }
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      throw new Error('该用户名已被使用')
    }
    
    // 创建新用户
    const newUser: EmergencyUser = {
      id: 'emergency_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email,
      username,
      password, // 注意：实际应用中需要加密
      coins: 50,
      exp: 0,
      created_at: new Date().toISOString()
    }
    
    users.push(newUser)
    this.saveUsers(users)
    
    console.log('紧急注册成功:', newUser)
    return newUser
  }

  async signIn(email: string, password: string): Promise<EmergencyUser> {
    const users = this.getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('邮箱或密码错误')
    }
    
    return user
  }

  async getCurrentUser(): Promise<EmergencyUser | null> {
    const currentUserEmail = localStorage.getItem('emergency_current_user')
    if (!currentUserEmail) return null
    
    const users = this.getUsers()
    return users.find(u => u.email === currentUserEmail) || null
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('emergency_current_user')
  }

  // 设置当前登录用户
  setCurrentUser(email: string): void {
    localStorage.setItem('emergency_current_user', email)
  }

  // 检查是否在使用紧急模式
  static isEmergencyMode(): boolean {
    return localStorage.getItem('emergency_auth_mode') === 'true'
  }

  // 启用紧急模式
  static enableEmergencyMode(): void {
    localStorage.setItem('emergency_auth_mode', 'true')
  }

  // 禁用紧急模式
  static disableEmergencyMode(): void {
    localStorage.removeItem('emergency_auth_mode')
    localStorage.removeItem('emergency_current_user')
  }
}

export const emergencyAuthService = new EmergencyAuthService()