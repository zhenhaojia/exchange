import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Calendar, 
  Badge,
  Modal,
  message,
  Space
} from 'antd'
import { 
  CalendarOutlined, 
  CrownOutlined, 
  GiftOutlined,
  CheckCircleOutlined,
  BookOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { bookService } from '../services/books'
import { Book } from '../types'
import { COIN_CONFIG } from '../constants'
import './DailyCheckIn.css'

const { Title, Paragraph } = Typography

const DailyCheckIn: React.FC = () => {
  const { user } = useAuthStore()
  const { coins, transactions, dailyCheckIn, fetchCoins, fetchTransactions } = useCoinStore()
  const [loading, setLoading] = useState(false)
  const [checkInSuccess, setCheckInSuccess] = useState(false)
  const [dailyBooks, setDailyBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [bookModalVisible, setBookModalVisible] = useState(false)

  const hasCheckedInToday = () => {
    if (!user) return false
    const today = new Date().toDateString()
    return transactions.some(t => 
      t.source === 'daily_checkin' && 
      new Date(t.created_at).toDateString() === today
    )
  }

  const getCheckInDays = () => {
    if (!user) return []
    const checkInDates = transactions
      .filter(t => t.source === 'daily_checkin')
      .map(t => new Date(t.created_at).toDateString())
    
    return checkInDates
  }

  const getListData = (value: any) => {
    const dateStr = value.toDate().toDateString()
    const checkInDates = getCheckInDays()
    
    if (checkInDates.includes(dateStr)) {
      return { type: 'success', content: '已签到' }
    }
    return {}
  }

  const cellRender = (value: any) => {
    const listData = getListData(value)
    return listData.type ? (
      <div className="calendar-cell">
        <Badge status={listData.type} text={listData.content} />
      </div>
    ) : null
  }

  const handleCheckIn = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const success = await dailyCheckIn(user.id)
      if (success) {
        setCheckInSuccess(true)
        message.success(`签到成功！获得${COIN_CONFIG.DAILY_CHECKIN_BONUS}虚拟币！`)
        await fetchCoins(user.id)
        await fetchTransactions(user.id)
      } else {
        message.warning('今日已签到')
      }
    } catch (error: any) {
      message.error(error.message || '签到失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReadDailyBook = (book: Book) => {
    setSelectedBook(book)
    setBookModalVisible(true)
  }

  useEffect(() => {
    const fetchDailyBooks = async () => {
      try {
        const { books } = await bookService.getBooks({}, { page: 1, limit: 5 })
        setDailyBooks(books)
      } catch (error) {
        console.error('Failed to fetch daily books:', error)
      }
    }

    fetchDailyBooks()
  }, [])

  useEffect(() => {
    if (user) {
      fetchCoins(user.id)
      fetchTransactions(user.id)
    }
  }, [user, fetchCoins, fetchTransactions])

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className="daily-checkin">
      <div className="container">
        {/* 签到区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="checkin-section"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card className="checkin-card">
                <div className="checkin-content">
                  <CalendarOutlined className="checkin-icon" />
                  <Title level={2}>每日签到</Title>
                  <Paragraph>
                    每日签到可获得{COIN_CONFIG.DAILY_CHECKIN_BONUS}虚拟币奖励，
                    坚持签到还能获得额外奖励！
                  </Paragraph>
                  
                  <div className="checkin-stats">
                    <Statistic
                      title="当前虚拟币"
                      value={coins}
                      prefix={<CrownOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={hasCheckedInToday() ? <CheckCircleOutlined /> : <GiftOutlined />}
                    loading={loading}
                    disabled={hasCheckedInToday()}
                    onClick={handleCheckIn}
                    className="checkin-button"
                  >
                    {hasCheckedInToday() ? '今日已签到' : '立即签到'}
                  </Button>

                  {checkInSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="success-message"
                    >
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      签到成功！获得{COIN_CONFIG.DAILY_CHECKIN_BONUS}虚拟币
                    </motion.div>
                  )}
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="calendar-card">
                <Title level={3}>签到日历</Title>
                <Calendar
                  cellRender={cellRender}
                  fullscreen={false}
                  className="checkin-calendar"
                />
                <div className="calendar-legend">
                  <Space>
                    <span><Badge status="success" /> 已签到</span>
                    <span><Badge status="default" /> 未签到</span>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* 每日推荐图书 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="daily-books-section"
        >
          <Card>
            <Title level={2}>
              <BookOutlined /> 每日精选推荐
            </Title>
            <Paragraph>
              阅读每日推荐的图书可获得{COIN_CONFIG.DAILY_READ_BONUS}虚拟币奖励
            </Paragraph>

            <Row gutter={[16, 16]}>
              {dailyBooks.map((book, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card
                      hoverable
                      className="daily-book-card"
                      cover={
                        <div className="book-cover">
                          {book.cover_image ? (
                            <img src={book.cover_image} alt={book.title} />
                          ) : (
                            <div className="default-cover">
                              <BookOutlined />
                              <span>暂无封面</span>
                            </div>
                          )}
                        </div>
                      }
                      onClick={() => handleReadDailyBook(book)}
                    >
                      <Card.Meta
                        title={book.title}
                        description={
                          <div>
                            <p className="book-author">{book.author}</p>
                            <p className="book-reward">
                              <CrownOutlined /> +{COIN_CONFIG.DAILY_READ_BONUS} 币
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

        {/* 签到统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stats-section"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="本月签到天数"
                  value={getCheckInDays().filter(date => {
                    const d = new Date(date)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  }).length}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="累计获得虚拟币"
                  value={transactions
                    .filter(t => t.type === 'earn')
                    .reduce((sum, t) => sum + t.amount, 0)}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="连续签到天数"
                  value={7}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>
      </div>

      {/* 图书详情模态框 */}
      <Modal
        title={selectedBook?.title}
        open={bookModalVisible}
        onCancel={() => setBookModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setBookModalVisible(false)}>
            关闭
          </Button>,
          <Button key="read" type="primary">
            开始阅读
          </Button>,
        ]}
        width={600}
      >
        {selectedBook && (
          <div className="book-detail">
            <div className="book-cover-large">
              {selectedBook.cover_image ? (
                <img src={selectedBook.cover_image} alt={selectedBook.title} />
              ) : (
                <div className="default-cover-large">
                  <BookOutlined />
                  <span>暂无封面</span>
                </div>
              )}
            </div>
            
            <div className="book-info">
              <Title level={4}>{selectedBook.title}</Title>
              <Paragraph><strong>作者：</strong>{selectedBook.author}</Paragraph>
              <Paragraph><strong>分类：</strong>{selectedBook.category}</Paragraph>
              <Paragraph><strong>品相：</strong>{selectedBook.condition}</Paragraph>
              <Paragraph><strong>交换所需：</strong>{selectedBook.exchange_coins} 虚拟币</Paragraph>
              <Paragraph><strong>阅读奖励：</strong>+{COIN_CONFIG.DAILY_READ_BONUS} 虚拟币</Paragraph>
              <Paragraph>{selectedBook.description}</Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DailyCheckIn