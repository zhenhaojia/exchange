import { supabase } from './supabase'

export interface StatsData {
  totalUsers: number
  totalBooks: number
  totalExchanges: number
  totalReadings: number
}

export const statsService = {
  // 获取平台统计数据
  async getStats(): Promise<StatsData> {
    const [
      { count: totalUsers },
      { count: totalBooks },
      { count: totalExchanges },
      { count: totalReadings }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('exchanges').select('*', { count: 'exact', head: true }),
      supabase.from('reading_sessions').select('*', { count: 'exact', head: true })
    ])

    return {
      totalUsers: totalUsers || 0,
      totalBooks: totalBooks || 0,
      totalExchanges: totalExchanges || 0,
      totalReadings: totalReadings || 0
    }
  },

  // 获取热门图书
  async getPopularBooks(limit: number = 5) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'available')
      .order('view_count', { ascending: false })
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取热门图书失败:', error)
      return []
    }
    return data || []
  },

  // 获取最新图书
  async getLatestBooks(limit: number = 5) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取最新图书失败:', error)
      return []
    }
    return data || []
  },

  // 获取每日推荐图书
  async getDailyRecommendations(limit: number = 3) {
    try {
      // 先尝试获取今天的推荐，如果没有则获取最近的推荐
      const today = new Date().toISOString().split('T')[0]
      
      console.log('获取每日推荐数据，日期:', today)
      
      const { data: todayData, error: todayError } = await supabase
        .from('daily_recommendations')
        .select('*')
        .eq('recommend_date', today)
        .limit(limit)

      console.log('今日推荐查询结果:', { todayData, todayError })

      if (todayError) {
        console.error('获取今日推荐失败:', todayError)
        // 继续执行，不抛出错误
      }
      
      // 如果今天有推荐，获取对应的图书信息
      if (todayData && todayData.length > 0) {
        const bookIds = todayData.map(item => item.book_id)
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('*')
          .in('id', bookIds)
          .eq('status', 'available')
        
        if (!booksError && books) {
          console.log('返回今日推荐图书:', books)
          return books
        }
      }
      
      console.log('没有今日推荐，获取最近的推荐')
      // 如果没有今天的推荐，获取最近的推荐
      const { data: recentData, error: recentError } = await supabase
        .from('daily_recommendations')
        .select('*')
        .order('recommend_date', { ascending: false })
        .limit(limit)

      if (!recentError && recentData && recentData.length > 0) {
        const bookIds = recentData.map(item => item.book_id)
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('*')
          .in('id', bookIds)
          .eq('status', 'available')
        
        if (!booksError && books) {
          console.log('返回最近推荐图书:', books)
          return books
        }
      }
      
      // 如果都没有推荐，返回一些默认图书
      const { data: defaultBooks, error: defaultError } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available')
        .limit(limit)
      
      if (defaultError) {
        console.error('获取默认图书失败:', defaultError)
        return []
      }
      
      console.log('返回默认推荐图书:', defaultBooks)
      return defaultBooks || []
      
    } catch (error) {
      console.error('获取每日推荐时发生错误:', error)
      return []
    }
  }
}