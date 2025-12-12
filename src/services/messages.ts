import { supabase } from './supabase'
import { Message, Conversation } from '../types'

export interface SendMessageParams {
  to_user_id: string
  content: string
  type?: 'message' | 'exchange_inquiry' | 'book_question'
  book_id?: string
}

export interface GetMessagesParams {
  other_user_id: string
  limit?: number
  offset?: number
}

export const messageService = {
  // 发送消息
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const { data, error } = await supabase.rpc('send_message', {
      to_user_id: params.to_user_id,
      content: params.content,
      message_type: params.type || 'message',
      related_book_id: params.book_id || null
    })

    if (error) {
      console.error('发送消息失败:', error)
      throw new Error(error.message || '发送消息失败')
    }

    // 获取完整的消息信息
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey(id, username, avatar),
        to_user:users!messages_to_user_id_fkey(id, username, avatar)
      `)
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('获取消息详情失败:', fetchError)
      throw new Error('发送成功但获取详情失败')
    }

    return message as Message
  },

  // 获取对话列表
  async getConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .rpc('get_user_conversations')

    if (error) {
      console.error('获取对话列表失败:', error)
      throw new Error(error.message || '获取对话列表失败')
    }

    // 格式化数据
    const conversations = data.map((item: any) => ({
      id: item.conversation_id,
      other_user: {
        id: item.other_user_id,
        username: item.other_username,
        avatar: item.other_avatar
      },
      last_message_content: item.last_message,
      last_message_at: item.last_message_time,
      unread_count: parseInt(item.unread_count),
      user1_id: '', // 这些信息在列表视图中不需要
      user2_id: '',
      is_archived: false,
      created_at: ''
    })) as Conversation[]

    return conversations
  },

  // 获取特定对话的消息
  async getConversationMessages(params: GetMessagesParams): Promise<Message[]> {
    const { data, error } = await supabase
      .rpc('get_conversation_messages', {
        other_user_id: params.other_user_id,
        limit_count: params.limit || 50,
        offset_count: params.offset || 0
      })

    if (error) {
      console.error('获取消息历史失败:', error)
      throw new Error(error.message || '获取消息历史失败')
    }

    // 获取用户详细信息
    const userIds = [...new Set([
      ...data.map((msg: any) => msg.from_user_id),
      ...data.map((msg: any) => msg.to_user_id)
    ])]

    const { data: users } = await supabase
      .from('users')
      .select('id, username, avatar')
      .in('id', userIds)

    const userMap = users?.reduce((acc: any, user: any) => {
      acc[user.id] = user
      return acc
    }, {}) || {}

    // 格式化消息数据
    return data.map((msg: any) => ({
      id: msg.message_id,
      from_user_id: msg.from_user_id,
      to_user_id: msg.to_user_id,
      content: msg.content,
      is_read: msg.is_read,
      type: msg.type,
      created_at: msg.created_at,
      updated_at: msg.created_at,
      from_user: userMap[msg.from_user_id],
      to_user: userMap[msg.to_user_id]
    })) as Message[]
  },

  // 标记消息为已读
  async markAsRead(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('to_user_id', supabase.auth.currentUser?.id)

    if (error) {
      console.error('标记消息已读失败:', error)
      throw new Error(error.message || '标记消息已读失败')
    }

    return true
  },

  // 标记整个对话为已读
  async markConversationAsRead(otherUserId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('mark_conversation_as_read', {
        other_user_id: otherUserId
      })

    if (error) {
      console.error('标记对话已读失败:', error)
      throw new Error(error.message || '标记对话已读失败')
    }

    return data || 0
  },

  // 获取未读消息数量
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', supabase.auth.currentUser?.id)
      .eq('is_read', false)

    if (error) {
      console.error('获取未读消息数量失败:', error)
      return 0
    }

    return count || 0
  },

  // 删除消息（仅发送方或接收方）
  async deleteMessage(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .or(`from_user_id.eq.${supabase.auth.currentUser?.id},to_user_id.eq.${supabase.auth.currentUser?.id}`)

    if (error) {
      console.error('删除消息失败:', error)
      throw new Error(error.message || '删除消息失败')
    }

    return true
  },

  // 监听新消息
  subscribeToMessages(otherUserId?: string, callback?: (message: Message) => void) {
    const currentUserId = supabase.auth.currentUser?.id
    
    let query = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `to_user_id=eq.${currentUserId}`
        }, 
        async (payload) => {
          // 获取完整的消息信息
          const { data: message } = await supabase
            .from('messages')
            .select(`
              *,
              from_user:users!messages_from_user_id_fkey(id, username, avatar),
              to_user:users!messages_to_user_id_fkey(id, username, avatar),
              book:books(id, title, cover_image)
            `)
            .eq('id', payload.new.id)
            .single()

          if (message && callback) {
            callback(message as Message)
          }
        }
      )

    if (otherUserId) {
      query = query.or(`(from_user_id=eq.${otherUserId},to_user_id=eq.${otherUserId})`)
    }

    query.subscribe()

    return {
      unsubscribe: () => supabase.removeChannel('messages')
    }
  },

  // 监听对话列表变化
  subscribeToConversations(callback?: (conversation: Conversation) => void) {
    const currentUserId = supabase.auth.currentUser?.id
    
    const subscription = supabase
      .channel('conversations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `or=(from_user_id=eq.${currentUserId},to_user_id=eq.${currentUserId})`
        }, 
        async () => {
          // 当有新消息时，重新获取对话列表
          try {
            const conversations = await messageService.getConversations()
            if (callback) {
              callback(conversations[0]) // 传递最新的对话
            }
          } catch (error) {
            console.error('获取对话列表失败:', error)
          }
        }
      )
      .subscribe()

    return {
      unsubscribe: () => supabase.removeChannel('conversations')
    }
  }
}