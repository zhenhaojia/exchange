import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Tag, 
  Avatar,
  Divider,
  message,
  Space,
  Spin,
  Modal
} from 'antd'
import { 
  UserOutlined, 
  CrownOutlined, 
  BookOutlined,
  SwapOutlined,
  ReadOutlined,
  MessageOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { bookService } from '../services/books'
import { coinService } from '../services/coins'
import { messageService } from '../services/messages'
import { Book } from '../types'
import { BOOK_CONDITIONS, COIN_CONFIG } from '../constants'
import BookCover from '../components/BookCover'
import './BookDetail.css'

const { Title, Paragraph, Text } = Typography

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isFromFreeRead = new URLSearchParams(window.location.search).get('free_read') === 'true'
  const { user } = useAuthStore()
  const { coins } = useCoinStore()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false)
  const [readModalVisible, setReadModalVisible] = useState(false)
  const [hasFreeReadAccess, setHasFreeReadAccess] = useState(false)
  const [checkingFreeAccess, setCheckingFreeAccess] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const bookData = await bookService.getBookById(id)
        setBook(bookData)
      } catch (error: any) {
        message.error(error.message || '获取图书信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()

    // 检查是否有免费阅读权限
    const checkFreeReadAccess = async () => {
      if (!user || !book || checkingFreeAccess) return
      
      setCheckingFreeAccess(true)
      
      try {
        // 如果是从首页免费阅读过来的，则直接给予权限
        let hasFreeAccess = isFromFreeRead
        
        // 否则检查今日是否已免费阅读过此书
        if (!hasFreeAccess) {
          hasFreeAccess = await coinService.readCarouselBook(user.id, book.id)
        }
        
        setHasFreeReadAccess(hasFreeAccess)
        
        console.log('免费阅读权限检查:', { 
          bookId: book.id, 
          hasFreeAccess,
          isFromFreeRead,
          bookTitle: book.title 
        })
      } catch (error) {
        console.error('检查免费阅读权限失败:', error)
        setHasFreeReadAccess(false)
      } finally {
        setCheckingFreeAccess(false)
      }
    }

    checkFreeReadAccess()
  }, [id, user, book?.id]) // 只在book.id变化时重新检查

  const handleExchange = async () => {
    if (!user || !book) return
    
    if (coins < book.exchange_coins) {
      message.error(`虚拟币不足，还需要${book.exchange_coins - coins}个虚拟币`)
      return
    }

    try {
      await coinService.deductCoins(
        user.id,
        book.exchange_coins,
        'exchange',
        `交换图书：《${book.title}》`
      )
      
      message.success('交换请求已发送！请等待书友确认')
      setExchangeModalVisible(false)
      
      // 这里可以发送通知给图书所有者
    } catch (error: any) {
      message.error(error.message || '交换失败')
    }
  }

  const handleContactOwner = async () => {
    if (!user || !book || !book.owner) return

    try {
      // 发送一个关于图书的询问消息
      await messageService.sendMessage({
        to_user_id: book.owner.id,
        content: `您好，我对您发布的图书《${book.title}》很感兴趣，请问这本书还在吗？`,
        type: 'book_question',
        book_id: book.id
      })

      message.success('消息已发送！您可以在消息中心查看回复')
      
      // 跳转到消息中心
      navigate(`/messages/${book.owner.id}`)
    } catch (error: any) {
      message.error(error.message || '发送消息失败')
    }
  }

  const handleRead = async () => {
    if (!user || !book) return
    
    // 检查是否有免费阅读权限
    if (hasFreeReadAccess) {
      message.success('开始免费阅读！')
      window.location.href = `/read/${book.id}?free_read=true`
      return
    }
    
    if (coins < COIN_CONFIG.READ_BOOK_COST) {
      message.error(`虚拟币不足，还需要${COIN_CONFIG.READ_BOOK_COST - coins}个虚拟币`)
      return
    }

    try {
      await coinService.deductCoins(
        user.id,
        COIN_CONFIG.READ_BOOK_COST,
        'read',
        `阅读图书：《${book.title}》`
      )
      
      message.success('开始阅读！扣除5虚拟币')
      window.location.href = `/read/${book.id}`
      
      // 这里可以打开阅读界面或跳转到阅读页面
    } catch (error: any) {
      message.error(error.message || '阅读失败')
    }
  }

  const getConditionLabel = (condition: string) => {
    const found = BOOK_CONDITIONS.find(c => c.value === condition)
    return found ? found.label : condition
  }

  const getConditionColor = (condition: string) => {
    const colorMap: Record<string, string> = {
      new: 'green',
      good: 'blue',
      fair: 'orange',
      poor: 'red',
    }
    return colorMap[condition] || 'default'
  }

  if (loading) {
    return (
      <div className="book-detail-loading">
        <Spin size="large" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="book-detail-error">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <BookOutlined style={{ fontSize: 48, color: '#ccc' }} />
            <Title level={3}>图书不存在</Title>
            <Paragraph>您访问的图书可能已被删除或不存在</Paragraph>
            <Button type="primary" onClick={() => navigate('/books')}>
              返回图书广场
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="book-detail">
      <div className="container">
        {/* 返回按钮 */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 24 }}
        >
          返回
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Row gutter={[32, 24]}>
            {/* 图书封面和基本信息 */}
            <Col xs={24} md={10}>
              <Card className="book-cover-card">
                <div className="book-cover">
                  <BookCover
                    coverUrl={book.cover_image || book.cover_url}
                    title={book.title}
                    category={book.category}
                    width={200}
                    height={280}
                  />
                </div>

                <div className="book-meta">
                  <Title level={2} className="book-title">{book.title}</Title>
                  <Text className="book-author">作者：{book.author}</Text>
                  
                  <div className="book-tags">
                    <Tag color="blue">{book.category}</Tag>
                    <Tag color={getConditionColor(book.condition)}>
                      {getConditionLabel(book.condition)}
                    </Tag>
                  </div>

                  <div className="book-coins">
                    <CrownOutlined className="coin-icon" />
                    <span className="coin-amount">{book.exchange_coins}</span>
                    <span className="coin-label">虚拟币</span>
                  </div>

                  <Divider />

                  <div className="book-stats">
                    <div className="stat-item">
                      <SwapOutlined />
                      <span>已交换 {book.exchange_count} 次</span>
                    </div>
                    <div className="stat-item">
                      <ReadOutlined />
                      <span>阅读 {book.read_count || 0} 次</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* 图书详情和操作 */}
            <Col xs={24} md={14}>
              <Card className="book-info-card">
                {/* 图书所有者信息 */}
                <div className="owner-info">
                  <Title level={4}>书友信息</Title>
                  <div className="owner-card">
                    <Avatar 
                      size={48}
                      src={book.owner?.avatar}
                      icon={<UserOutlined />}
                    />
                    <div className="owner-details">
                      <Text strong>{book.owner?.username}</Text>
                      <Text type="secondary">发布于 {new Date(book.created_at).toLocaleDateString()}</Text>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* 图书描述 */}
                <div className="book-description">
                  <Title level={4}>图书简介</Title>
                  <Paragraph>
                    {book.description || '这本书暂时没有简介信息。'}
                  </Paragraph>
                </div>

                {/* 图书标签 */}
                {book.tags && book.tags.length > 0 && (
                  <>
                    <Divider />
                    <div className="book-tags-section">
                      <Title level={4}>标签</Title>
                      <Space wrap>
                        {book.tags.map((tag, index) => (
                          <Tag key={index}>{tag}</Tag>
                        ))}
                      </Space>
                    </div>
                  </>
                )}

                <Divider />

                {/* 操作按钮 */}
                <div className="book-actions">
                  {user ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<SwapOutlined />}
                        block
                        disabled={book.status !== 'available'}
                        onClick={() => setExchangeModalVisible(true)}
                      >
                        申请交换 ({book.exchange_coins} 币)
                      </Button>

                      <Button
                        size="large"
                        icon={<ReadOutlined />}
                        block
                        onClick={() => setReadModalVisible(true)}
                        type={hasFreeReadAccess ? "default" : "primary"}
                      >
                        在线阅读 {hasFreeReadAccess ? "(免费)" : `(${COIN_CONFIG.READ_BOOK_COST} 币)`}
                      </Button>

                      <Button
                        size="large"
                        icon={<MessageOutlined />}
                        block
                        onClick={handleContactOwner}
                      >
                        联系书友
                      </Button>
                    </Space>
                  ) : (
                    <div className="login-prompt">
                      <Text type="secondary">
                        请先登录后再进行交换或阅读操作
                      </Text>
                      <Button 
                        type="primary" 
                        block 
                        onClick={() => navigate('/login')}
                        style={{ marginTop: 16 }}
                      >
                        立即登录
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </div>

      {/* 交换确认模态框 */}
      <Modal
        title="确认交换"
        open={exchangeModalVisible}
        onOk={handleExchange}
        onCancel={() => setExchangeModalVisible(false)}
        okText="确认交换"
        cancelText="取消"
      >
        <div className="exchange-confirm">
          <div className="exchange-info">
            <p><strong>图书：</strong>{book.title}</p>
            <p><strong>作者：</strong>{book.author}</p>
            <p><strong>交换费用：</strong>{book.exchange_coins} 虚拟币</p>
            <p><strong>当前余额：</strong>{coins} 虚拟币</p>
            {coins < book.exchange_coins && (
              <p className="insufficient-coins">
                <Text type="danger">
                  虚拟币不足！还需要 {book.exchange_coins - coins} 个虚拟币
                </Text>
              </p>
            )}
          </div>
          
          <Paragraph type="secondary">
            交换请求发送后，书友将在24小时内确认，请耐心等待。
          </Paragraph>
        </div>
      </Modal>

      {/* 阅读确认模态框 */}
      <Modal
        title="确认阅读"
        open={readModalVisible}
        onOk={handleRead}
        onCancel={() => setReadModalVisible(false)}
        okText="开始阅读"
        cancelText="取消"
      >
        <div className="read-confirm">
          <div className="read-info">
            <p><strong>图书：</strong>{book.title}</p>
            <p><strong>阅读费用：</strong>{COIN_CONFIG.READ_BOOK_COST} 虚拟币</p>
            <p><strong>当前余额：</strong>{coins} 虚拟币</p>
            {coins < COIN_CONFIG.READ_BOOK_COST && (
              <p className="insufficient-coins">
                <Text type="danger">
                  虚拟币不足！还需要 {COIN_CONFIG.READ_BOOK_COST - coins} 个虚拟币
                </Text>
              </p>
            )}
          </div>
          
          <Paragraph type="secondary">
            阅读费用将直接从您的虚拟币余额中扣除。
          </Paragraph>
        </div>
      </Modal>
    </div>
  )
}

export default BookDetail