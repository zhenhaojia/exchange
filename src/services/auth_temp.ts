// 临时注册服务，用于调试 500 错误
import { supabase } from './supabase'

export const tempAuthService = {
  // 简化的注册测试
  async simpleSignUp(email: string, password: string, username: string) {
    console.log('尝试简化注册...')
    
    try {
      // 1. 先测试基本连接
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('数据库连接测试失败:', testError)
        throw new Error('数据库连接失败: ' + testError.message)
      }
      
      // 2. 尝试注册，不包含额外的用户数据
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {}, // 暂时不包含用户名，避免触发器问题
        },
      })

      if (error) {
        console.error('简化注册失败:', error)
        throw error
      }

      console.log('简化注册成功:', data)
      return data
    } catch (error: any) {
      console.error('简化注册过程中发生错误:', error)
      throw error
    }
  }
}