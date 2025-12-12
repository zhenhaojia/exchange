import { supabase } from './supabase'
import { CoinTransaction } from '../types'
import { COIN_CONFIG } from '../constants'

export const coinService = {
  // 获取用户虚拟币余额
  async getUserCoins(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data.coins || 0
  },

  // 增加虚拟币
  async addCoins(userId: string, amount: number, source: string, description: string) {
    // 获取当前用户余额
    const { data: currentUser } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      throw new Error('用户不存在')
    }

    // 更新用户余额
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        coins: currentUser.coins + amount 
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // 记录交易
    const { error: transactionError } = await supabase
      .from('coin_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'earn',
        source,
        description,
        created_at: new Date().toISOString()
      })

    if (transactionError) throw transactionError
  },

  // 扣除虚拟币
  async deductCoins(userId: string, amount: number, source: string, description: string) {
    // 检查余额是否足够
    const currentCoins = await this.getUserCoins(userId)
    if (currentCoins < amount) {
      throw new Error('虚拟币不足')
    }

    // 更新用户余额
    const { error: updateError } = await supabase.rpc('deduct_user_coins', {
      user_id: userId,
      amount: amount
    })

    if (updateError) throw updateError

    // 记录交易
    const { error: transactionError } = await supabase
      .from('coin_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'spend',
        source,
        description,
      })

    if (transactionError) throw transactionError
  },

  // 获取交易记录
  async getTransactions(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as CoinTransaction[]
  },

  // 每日签到奖励
  async dailyCheckIn(userId: string): Promise<boolean> {
    try {
      // 尝试使用数据库函数
      const { data, error } = await supabase.rpc('daily_checkin_reward_safe', {
        user_id_param: userId
      })

      if (error) {
        console.error('RPC函数调用失败，尝试备用方案:', error)
        return await this.dailyCheckInFallback(userId)
      }

      return data || false
    } catch (error: any) {
      console.error('签到错误:', error)
      throw new Error('签到失败：' + (error.message || '请稍后重试'))
    }
  },

  // 备用签到方案（不依赖RPC函数）
  async dailyCheckInFallback(userId: string): Promise<boolean> {
    try {
      // 检查今日是否已签到
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('coin_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('source', 'daily_checkin')
        .gte('created_at', today)
        .limit(1)

      if (existing && existing.length > 0) {
        return false // 今日已签到
      }

      // 获取当前用户信息
      const { data: currentUser } = await supabase
        .from('users')
        .select('coins, exp')
        .eq('id', userId)
        .single()

      if (!currentUser) {
        throw new Error('用户不存在')
      }

      // 更新用户虚拟币和经验
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          coins: (currentUser.coins || 0) + 10,
          exp: (currentUser.exp || 0) + 5
        })
        .eq('id', userId)

      if (userUpdateError) {
        console.error('更新用户余额失败:', userUpdateError)
        throw userUpdateError
      }

      // 记录交易
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          amount: 10,
          type: 'earn',
          source: 'daily_checkin',
          description: '每日签到奖励',
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('记录交易失败:', transactionError)
        throw transactionError
      }

      return true
    } catch (error: any) {
      console.error('备用签到方案错误:', error)
      throw error
    }
  },

  // 免费阅读轮播图图书
  async readCarouselBook(userId: string, bookId: string): Promise<boolean> {
    try {
      // 检查今日是否已阅读过该书
      const today = new Date().toISOString().split('T')[0]
      const { data: existingSession } = await supabase
        .from('reading_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .gte('created_at', today)
        .limit(1)

      if (existingSession && existingSession.length > 0) {
        // 今日已阅读过，但可以继续免费阅读
        return true
      }

      // 获取当前用户信息
      const { data: currentUser } = await supabase
        .from('users')
        .select('coins, exp')
        .eq('id', userId)
        .single()

      if (!currentUser) {
        throw new Error('用户不存在')
      }

      // 记录免费阅读会话
      const sessionData: any = {
        user_id: userId,
        book_id: bookId,
        is_free_read: true
      }

      // 只有当 coins_cost 列存在时才添加
      try {
        const { data: columnCheck } = await supabase
          .from('reading_sessions')
          .select('coins_cost')
          .limit(1)
        
        if (columnCheck !== null) {
          sessionData.coins_cost = 0
        }
      } catch (e) {
        // 列不存在，跳过
      }

      // 只有当 coins_earned 列存在时才添加
      try {
        const { data: earnedCheck } = await supabase
          .from('reading_sessions')
          .select('coins_earned')
          .limit(1)
        
        if (earnedCheck !== null) {
          sessionData.coins_earned = COIN_CONFIG.DAILY_READ_BONUS
        }
      } catch (e) {
        // 列不存在，跳过
      }

      // 只有当 created_at 列存在时才添加
      try {
        await supabase
          .from('reading_sessions')
          .select('created_at')
          .limit(1)
        sessionData.created_at = new Date().toISOString()
      } catch (e) {
        // 列不存在，跳过
      }

      const { error: sessionError } = await supabase
        .from('reading_sessions')
        .insert(sessionData)

      if (sessionError) {
        console.error('记录阅读会话失败:', sessionError)
      }

      // 更新用户虚拟币和经验
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          coins: currentUser.coins + COIN_CONFIG.DAILY_READ_BONUS,
          exp: currentUser.exp + 2
        })
        .eq('id', userId)

      if (userUpdateError) {
        console.error('更新用户奖励失败:', userUpdateError)
        throw userUpdateError
      }

      // 记录交易
      const transactionData: any = {
        user_id: userId,
        amount: COIN_CONFIG.DAILY_READ_BONUS,
        type: 'earn',
        source: 'carousel_free_read', // 确保数据库约束允许此值
        description: '阅读轮播推荐图书奖励'
      }

      // 只有当 created_at 列存在时才添加
      try {
        await supabase
          .from('coin_transactions')
          .select('created_at')
          .limit(1)
        transactionData.created_at = new Date().toISOString()
      } catch (e) {
        // 列不存在，跳过
      }

      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert(transactionData)

      if (transactionError) {
        console.error('记录交易失败:', transactionError)
        throw transactionError
      }

      return true
    } catch (error: any) {
      console.error('免费阅读失败:', error)
      throw new Error('免费阅读失败：' + (error.message || '请稍后重试'))
    }
  },
}