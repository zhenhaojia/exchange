import { create } from 'zustand'
import { CoinTransaction } from '../types'
import { coinService } from '../services/coins'

interface CoinStore {
  coins: number
  transactions: CoinTransaction[]
  loading: boolean
  error: string | null
  
  fetchCoins: (userId: string) => Promise<void>
  fetchTransactions: (userId: string) => Promise<void>
  dailyCheckIn: (userId: string) => Promise<boolean>
  addCoins: (userId: string, amount: number, source: string, description: string) => Promise<void>
  deductCoins: (userId: string, amount: number, source: string, description: string) => Promise<void>
  clearError: () => void
}

export const useCoinStore = create<CoinStore>((set, get) => ({
  coins: 0,
  transactions: [],
  loading: false,
  error: null,

  fetchCoins: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const coins = await coinService.getUserCoins(userId)
      set({ coins, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchTransactions: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const transactions = await coinService.getTransactions(userId)
      set({ transactions, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  dailyCheckIn: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const success = await coinService.dailyCheckIn(userId)
      if (success) {
        // 重新获取余额
        await get().fetchCoins(userId)
        // 重新获取交易记录
        await get().fetchTransactions(userId)
      }
      set({ loading: false })
      return success
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  addCoins: async (userId: string, amount: number, source: string, description: string) => {
    try {
      await coinService.addCoins(userId, amount, source, description)
      // 更新本地状态
      set(state => ({ coins: state.coins + amount }))
      // 重新获取交易记录
      await get().fetchTransactions(userId)
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  deductCoins: async (userId: string, amount: number, source: string, description: string) => {
    try {
      await coinService.deductCoins(userId, amount, source, description)
      // 更新本地状态
      set(state => ({ coins: state.coins - amount }))
      // 重新获取交易记录
      await get().fetchTransactions(userId)
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))