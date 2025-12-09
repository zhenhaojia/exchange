// 测试 Supabase 认证连接
import { supabase } from './src/services/supabase'

async function testAuthConnection() {
  console.log('测试 Supabase 认证连接...')
  
  try {
    // 测试基本连接
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('数据库连接测试失败:', error)
    } else {
      console.log('✓ 数据库连接正常')
    }
    
    // 测试注册功能
    console.log('测试注册功能...')
    const testEmail = `test_${Date.now()}@example.com`
    const testPassword = 'test123456'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'testuser'
        }
      }
    })
    
    if (signUpError) {
      console.error('注册测试失败:', signUpError)
      console.error('错误详情:', {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code
      })
    } else {
      console.log('✓ 注册功能正常')
      console.log('注册响应:', signUpData)
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

testAuthConnection()