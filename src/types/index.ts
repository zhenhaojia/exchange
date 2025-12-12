export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  avatar_url?: string
  bio?: string
  coins: number
  level: number
  exp: number
  daily_check_in_last?: string
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  description: string
  cover_image?: string
  cover_url?: string
  category: string
  tags: string[]
  owner_id: string
  owner?: User
  status: 'available' | 'exchanged' | 'reserved'
  exchange_coins: number
  read_coins: number
  condition: 'new' | 'good' | 'fair' | 'poor'
  location?: string
  exchange_count: number
  created_at: string
  updated_at: string
}

export interface Exchange {
  id: string
  book_id: string
  book?: Book
  from_user_id: string
  to_user_id: string
  from_user?: User
  to_user?: User
  coins: number
  type: 'exchange' | 'read'
  status: 'pending' | 'completed' | 'cancelled'
  message?: string
  created_at: string
  updated_at?: string
  completed_at?: string
}

export interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  book_id?: string
  book?: Book
  content: string
  is_read: boolean
  type: 'message' | 'exchange_inquiry' | 'book_question' | 'system'
  created_at: string
  updated_at: string
  from_user?: User
  to_user?: User
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  other_user?: User
  last_message_content?: string
  last_message_at?: string
  last_message_from?: string
  unread_count: number
  is_archived: boolean
  created_at: string
}
  completed_at?: string
}

export interface DailyRecommendation {
  id: string
  book_id: string
  book?: Book
  recommend_reason: string
  bonus_coins: number
  is_read: boolean
  date: string
}

export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  type: 'earn' | 'spend'
  source: 'register' | 'daily_checkin' | 'daily_read' | 'exchange' | 'read' | 'system'
  description: string
  created_at: string
}

export interface AIRecommendation {
  books: Book[]
  reason: string
  timestamp: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface BookFilters {
  category?: string
  condition?: string
  min_coins?: number
  max_coins?: number
  search?: string
}