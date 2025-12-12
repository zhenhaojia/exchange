import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Layout, 
  List, 
  Avatar, 
  Typography, 
  Input, 
  Button, 
  Badge, 
  Empty, 
  Spin,
  Card,
  Divider,
  message,
  Space,
  Tooltip,
  BackTop
} from 'antd'
import { 
  SendOutlined, 
  ArrowLeftOutlined, 
  MessageOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { messageService, Message, Conversation } from '../services/messages'
import { User } from '../types'
import './MessageCenter.css'

const { Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const MessageCenter: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId?: string }>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null)

  useEffect(() => {
    fetchConversations()
    fetchUnreadCount()

    // 设置实时订阅
    const subscription = messageService.subscribeToConversations()
    setRealtimeSubscription(subscription)

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (userId) {
      // 从URL参数中查找对应的对话
      const conversation = conversations.find(conv => conv.other_user?.id === userId)
      if (conversation) {
        selectConversation(conversation)
      } else {
        // 如果没有找到对应对话，创建一个新的对话对象
        fetchUserAndCreateConversation(userId)
      }
    }
  }, [userId, conversations])

  useEffect(() => {
    // 自动滚动到底部
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations()
      setConversations(data)
      setLoading(false)
    } catch (error: any) {
      message.error(error.message || '获取对话列表失败')
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
    }
  }

  const fetchUserAndCreateConversation = async (userId: string) => {
    // 这里应该从用户服务获取用户信息，暂时创建一个简单的对话对象
    const mockConversation: Conversation = {
      id: '',
      user1_id: user?.id || '',
      user2_id: userId,
      other_user: {
        id: userId,
        username: '加载中...',
        avatar: undefined
      },
      unread_count: 0,
      is_archived: false,
      created_at: new Date().toISOString()
    }
    setSelectedConversation(mockConversation)
    fetchMessages(userId)
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setMessages([])
    
    // 标记对话为已读
    if (conversation.unread_count > 0) {
      try {
        await messageService.markConversationAsRead(conversation.other_user?.id || '')
        // 更新对话列表中的未读数量
        fetchConversations()
        fetchUnreadCount()
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    }

    // 获取消息历史
    fetchMessages(conversation.other_user?.id || '')
    
    // 更新URL
    navigate(`/messages/${conversation.other_user?.id}`, { replace: true })
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const data = await messageService.getConversationMessages({
        other_user_id: otherUserId,
        limit: 50
      })
      setMessages(data.reverse()) // 按时间顺序显示
    } catch (error: any) {
      message.error(error.message || '获取消息历史失败')
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    setSendingMessage(true)
    try {
      const newMessage = await messageService.sendMessage({
        to_user_id: selectedConversation.other_user?.id || '',
        content: messageInput.trim(),
        type: 'message'
      })

      // 添加到消息列表
      setMessages(prev => [...prev, newMessage])
      setMessageInput('')

      // 更新对话列表
      fetchConversations()
    } catch (error: any) {
      message.error(error.message || '发送消息失败')
    } finally {
      setSendingMessage(false)
    }
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    if (hours < 48) return '昨天'
    return date.toLocaleDateString()
  }

  const handleMessageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="请先登录" />
        <Button type="primary" onClick={() => navigate('/login')}>
          去登录
        </Button>
      </div>
    )
  }

  return (
    <div className="message-center">
      <Layout style={{ height: 'calc(100vh - 112px)' }}>
        {/* 左侧对话列表 */}
        <Sider width={350} className="conversation-sidebar">
          <div className="sidebar-header">
            <Title level={4}>消息</Title>
            {unreadCount > 0 && (
              <Badge count={unreadCount} size="small">
                <MessageOutlined />
              </Badge>
            )}
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div className="conversation-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : conversations.length > 0 ? (
              <List
                dataSource={conversations}
                renderItem={(conversation) => (
                  <List.Item
                    className={`conversation-item ${
                      selectedConversation?.other_user?.id === conversation.other_user?.id ? 'selected' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={conversation.unread_count} size="small">
                          <Avatar
                            size={40}
                            src={conversation.other_user?.avatar}
                            icon={<UserOutlined />}
                          />
                        </Badge>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{conversation.other_user?.username}</Text>
                          {conversation.last_message_at && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatTime(conversation.last_message_at)}
                            </Text>
                          )}
                        </div>
                      }
                      description={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text ellipsis style={{ color: '#666', fontSize: '13px' }}>
                            {conversation.last_message_content || '暂无消息'}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="暂无对话"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Sider>

        {/* 右侧聊天区域 */}
        <Content className="chat-content">
          {selectedConversation ? (
            <>
              {/* 聊天头部 */}
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => {
                      setSelectedConversation(null)
                      navigate('/messages')
                    }}
                    className="back-button"
                  />
                  <Avatar
                    size={36}
                    src={selectedConversation.other_user?.avatar}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>
                      {selectedConversation.other_user?.username}
                    </Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        在线
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: 0 }} />

              {/* 消息列表 */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <Empty
                    description="暂无消息，开始聊天吧"
                    style={{ marginTop: '100px' }}
                  />
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-item ${
                          message.from_user_id === user.id ? 'sent' : 'received'
                        }`}
                      >
                        <div className="message-avatar">
                          <Avatar
                            size={32}
                            src={message.from_user?.avatar || message.to_user?.avatar}
                            icon={<UserOutlined />}
                          />
                        </div>
                        <div className="message-content">
                          <div className="message-bubble">
                            {message.book && (
                              <div className="message-book-info">
                                <BookOutlined style={{ marginRight: '4px' }} />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                  关于《{message.book.title}》
                                </Text>
                              </div>
                            )}
                            <Paragraph style={{ margin: 0, wordBreak: 'break-word' }}>
                              {message.content}
                            </Paragraph>
                          </div>
                          <div className="message-time">
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              <ClockCircleOutlined style={{ marginRight: '2px' }} />
                              {formatTime(message.created_at)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* 消息输入框 */}
              <div className="message-input-container">
                <div className="input-wrapper">
                  <TextArea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleMessageKeyPress}
                    placeholder="输入消息..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ resize: 'none' }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    loading={sendingMessage}
                    disabled={!messageInput.trim()}
                    className="send-button"
                  >
                    发送
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <Empty
                description="选择一个对话开始聊天"
                image={<MessageOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
              />
            </div>
          )}
        </Content>
      </Layout>

      <BackTop />
    </div>
  )
}

export default MessageCenter