// 测试数据库连接的简单脚本
import { supabase } from './src/services/supabase'

async function testConnection() {
  console.log('开始测试数据库连接...')
  
  try {
    // 测试 books 表
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .limit(3)
    
    console.log('Books测试:', { books, booksError })
    
    // 测试 daily_recommendations 表
    const { data: recommendations, error: recError } = await supabase
      .from('daily_recommendations')
      .select('*')
      .limit(3)
    
    console.log('Recommendations测试:', { recommendations, recError })
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

testConnection()