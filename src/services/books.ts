import { supabase } from './supabase'
import { Book, BookFilters, PaginationParams } from '../types'

export const bookService = {
  // 获取图书列表
  async getBooks(filters: BookFilters = {}, pagination: PaginationParams = { page: 1, limit: 20 }) {
    // 临时修复：先查询图书，再单独查询用户信息
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })

    // 应用过滤条件
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition)
    }
    if (filters.min_coins) {
      query = query.gte('exchange_coins', filters.min_coins)
    }
    if (filters.max_coins) {
      query = query.lte('exchange_coins', filters.max_coins)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`)
    }

    // 只显示可用的图书
    query = query.eq('status', 'available')

    // 应用分页
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    console.log('图书查询结果:', { data, error, count })
    
    if (error) {
      console.error('图书查询错误:', error)
      throw error
    }

    // 如果有数据，获取用户信息
    let booksWithOwners = data as any[]
    if (data && data.length > 0) {
      const ownerIds = [...new Set(data.map(book => book.owner_id))]
      
      try {
        const { data: owners } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .in('id', ownerIds)
        
        booksWithOwners = data.map(book => ({
          ...book,
          owner: owners?.find(owner => owner.id === book.owner_id) || {
            id: book.owner_id,
            username: 'Unknown',
            avatar_url: null
          }
        }))
      } catch (ownerError) {
        console.warn('获取用户信息失败:', ownerError)
        booksWithOwners = data.map(book => ({
          ...book,
          owner: {
            id: book.owner_id,
            username: 'Unknown',
            avatar_url: null
          }
        }))
      }
    }

    console.log('返回的图书数据:', booksWithOwners)
    return { books: booksWithOwners as Book[], total: count || 0 }
  },

  // 获取图书详情
  async getBookById(id: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        owner:users(id, username, avatar_url, email)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Book
  },

  // 创建图书
  async createBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'exchange_count'>) {
    const { data, error } = await supabase
      .from('books')
      .insert(book)
      .select()
      .single()

    if (error) throw error
    return data as Book
  },

  // 更新图书
  async updateBook(id: string, updates: Partial<Book>) {
    const { data, error } = await supabase
      .from('books')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Book
  },

  // 删除图书
  async deleteBook(id: string) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 获取用户发布的图书
  async getUserBooks(userId: string) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Book[]
  },

  // 搜索图书
  async searchBooks(searchTerm: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('books')
      .select(`
        id, title, author, cover_image, category, exchange_coins
      `)
      .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
      .eq('status', 'available')
      .limit(limit)

    if (error) throw error
    return data as Book[]
  },
}