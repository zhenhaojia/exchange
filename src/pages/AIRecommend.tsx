import React, { useState } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Row, 
  Col,
  Avatar,
  Space,
  Spin,
  message,
  Divider
} from 'antd'
import { 
  RobotOutlined, 
  SendOutlined, 
  BookOutlined,
  UserOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { doubaoService } from '../services/doubao'
import { bookService } from '../services/books'
import { Book, AIRecommendation } from '../types'
import './AIRecommend.css'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const AIRecommend: React.FC = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState('')
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null)
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>>([])

  const handleGetRecommendation = async () => {
    if (!preferences.trim()) {
      message.warning('请描述您的阅读偏好')
      return
    }

    setLoading(true)
    try {
      // 获取用户的阅读历史（这里简化处理）
      const userBooks: Book[] = [] // 实际应该从API获取

      const aiRecommendation = await doubaoService.recommendBooks(preferences, userBooks)
      setRecommendation(aiRecommendation)

      // 添加到聊天历史
      setChatHistory(prev => [
        ...prev,
        {
          role: 'user',
          content: `我想看${preferences}类型的书，请帮我推荐一些`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `根据您的喜好"${preferences}"，我为您推荐了以下图书：\n\n${aiRecommendation.reason}\n\n${aiRecommendation.books.map(book => 
            `《${book.title}》- ${book.author}\n推荐理由：${book.recommendation_reason}`
          ).join('\n\n')}`,
          timestamp: new Date().toISOString()
        }
      ])
    } catch (error: any) {
      message.error(error.message || '获取推荐失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBookSearch = async (query: string) => {
    setLoading(true)
    try {
      const response = await doubaoService.searchBooksAssistant(query)
      
      setChatHistory(prev => [
        ...prev,
        {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        }
      ])
    } catch (error: any) {
      message.error(error.message || '搜索助手响应失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReadingAdvice = async () => {
    if (!user) return

    setLoading(true)
    try {
      const interests = ['文学', '历史', '科技'] // 实际应该从用户行为分析
      const userLevel = '初级' // 实际应该根据用户经验判断

      const advice = await doubaoService.getReadingAdvice(userLevel, interests)
      
      setChatHistory(prev => [
        ...prev,
        {
          role: 'user',
          content: '请给我一些读书建议',
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: advice,
          timestamp: new Date().toISOString()
        }
      ])
    } catch (error: any) {
      message.error(error.message || '获取读书建议失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="ai-recommend">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <RobotOutlined style={{ fontSize: 48, color: '#ccc' }} />
            <Title level={3}>AI智能推荐</Title>
            <Paragraph>请先登录后使用AI推荐功能</Paragraph>
            <Button type="primary" href="/login">
              立即登录
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="ai-recommend">
      <div className="container">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <Title level={1}>
            <RobotOutlined /> AI 智能推荐
          </Title>
          <Paragraph>
            基于您的阅读偏好，AI为您提供个性化的图书推荐和阅读建议
          </Paragraph>
        </motion.div>

        <Row gutter={[24, 24]}>
          {/* 左侧：推荐输入区 */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="recommend-input-card">
                <Title level={3}>
                  <BulbOutlined /> 告诉我您的喜好
                </Title>
                <Paragraph type="secondary">
                  请描述您喜欢什么类型的图书，比如：科幻小说、历史传记、心理学、编程技术等
                </Paragraph>

                <TextArea
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="例如：我喜欢推理小说，特别是阿加莎·克里斯蒂的作品..."
                  rows={4}
                  style={{ marginBottom: 16 }}
                />

                <Button
                  type="primary"
                  size="large"
                  icon={<RobotOutlined />}
                  loading={loading}
                  onClick={handleGetRecommendation}
                  block
                >
                  获取AI推荐
                </Button>

                <Divider />

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    icon={<BulbOutlined />}
                    onClick={handleReadingAdvice}
                    block
                  >
                    获取读书建议
                  </Button>
                </Space>
              </Card>
            </motion.div>
          </Col>

          {/* 右侧：推荐结果 */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="chat-card">
                <Title level={3}>
                  <RobotOutlined /> AI 助手对话
                </Title>

                <div className="chat-container">
                  {chatHistory.length === 0 ? (
                    <div className="chat-welcome">
                      <RobotOutlined className="chat-ai-icon" />
                      <Text type="secondary">
                        我是您的AI阅读助手，可以为您提供个性化的图书推荐和阅读建议。
                        告诉我您的喜好，让我为您推荐一些好书吧！
                      </Text>
                    </div>
                  ) : (
                    <div className="chat-messages">
                      {chatHistory.map((message, index) => (
                        <div key={index} className={`chat-message ${message.role}`}>
                          <Avatar
                            size={32}
                            icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                            className="message-avatar"
                          />
                          <div className="message-content">
                            <div className="message-text">
                              {message.content}
                            </div>
                            <div className="message-time">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {loading && (
                    <div className="chat-loading">
                      <Spin />
                      <Text type="secondary">AI正在思考中...</Text>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* 推荐图书展示 */}
        {recommendation && recommendation.books.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="recommendation-results"
          >
            <Card>
              <Title level={2}>为您推荐</Title>
              <Paragraph>{recommendation.reason}</Paragraph>

              <Row gutter={[24, 24]}>
                {recommendation.books.map((book, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card
                        hoverable
                        className="recommended-book-card"
                        cover={
                          <div className="book-cover">
                            <BookOutlined className="book-icon" />
                          </div>
                        }
                      >
                        <Card.Meta
                          title={book.title}
                          description={
                            <div>
                              <p className="book-author">{book.author}</p>
                              <p className="book-reason">
                                {book.recommendation_reason}
                              </p>
                            </div>
                          }
                        />
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AIRecommend