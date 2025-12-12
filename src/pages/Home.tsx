import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Button, Space, Statistic, Empty, Spin, Carousel, message, Modal, Divider } from 'antd'
import { Link } from 'react-router-dom'
import { 
  BookOutlined, 
  UserOutlined, 
  CrownOutlined,
  RocketOutlined,
  SwapOutlined,
  ReadOutlined,
  RobotOutlined,
  CalendarOutlined,
  FireOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { bookService } from '../services/books'
import { statsService } from '../services/stats'
import { Book } from '../types'
import { COIN_CONFIG } from '../constants'
import BookCover from '../components/BookCover'
import './Home.css'

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
  const { user } = useAuthStore()
  const { coins, fetchCoins, fetchTransactions } = useCoinStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalExchanges: 0,
    totalReadings: 0
  })
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [popularBooks, setPopularBooks] = useState<Book[]>([])
  const [latestBooks, setLatestBooks] = useState<Book[]>([])
  const [dailyRecommendations, setDailyRecommendations] = useState<Book[]>([])
  const [carouselBooks, setCarouselBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, featuredData, popularData, latestData, dailyData] = await Promise.all([
          statsService.getStats(),
          bookService.getBooks({}, { page: 1, limit: 6 }),
          statsService.getPopularBooks(4),
          statsService.getLatestBooks(4),
          statsService.getDailyRecommendations(3)
        ])

        setStats(statsData)
        setFeaturedBooks(featuredData.books || [])
        setPopularBooks(popularData || [])
        setLatestBooks(latestData || [])
        setDailyRecommendations(dailyData || [])

        // 如果用户已登录，获取最新的虚拟币状态
        if (user?.id) {
          await fetchCoins(user.id)
          await fetchTransactions(user.id)
        }
        
        // 设置轮播图书：如果每日推荐少于3本，用精选图书补充
        const dailyBooks = dailyData || []
        const additionalBooks = featuredData?.books?.filter(
          book => !dailyBooks.some(dailyBook => dailyBook.id === book.id)
        ).slice(0, 3 - dailyBooks.length) || []
        
        setCarouselBooks([...dailyBooks, ...additionalBooks])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#666' }}>加载首页数据中...</p>
      </div>
    )
  }

  return (
    <div className="home">
      {/* 轮播图区域 - 每日推荐图书 */}
      <section style={{ marginBottom: '60px', padding: '0 24px' }}>
        <Carousel 
          autoplay 
          dotPosition="right" 
          autoplaySpeed={3000}
          style={{
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          {carouselBooks.length > 0 ? (
            carouselBooks.map((book, index) => (
              <div key={book.id}>
                <div style={{
                  height: '300px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    maxWidth: '800px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px',
                    padding: '0 20px'
                  }}>
                    {/* 图书信息 */}
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{
                        fontSize: '14px',
                        opacity: 0.8,
                        marginBottom: '8px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px'
                      }}>今日推荐 #{index + 1}</div>
                      
                      <h1 style={{
                        color: 'white',
                        margin: '0 0 16px 0',
                        fontSize: '36px',
                        fontWeight: 'bold'
                      }}>{book.title}</h1>
                      
                      <p style={{
                        color: 'white',
                        opacity: 0.9,
                        margin: '0 0 16px 0',
                        fontSize: '18px'
                      }}>作者：{book.author}</p>
                      
                      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.2)',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '14px'
                        }}>{book.category}</span>
                        
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}>
                          <CrownOutlined /> {book.exchange_coins} 币
                        </span>
                      </div>
                      
                      <Button 
                        type="primary"
                        size="large"
                        style={{
                          background: 'white',
                          color: '#52c41a',
                          border: 'none',
                          borderRadius: '20px',
                          height: '40px',
                          fontSize: '16px'
                        }}
                        onClick={async () => {
                          console.log('免费阅读点击 - 当前用户:', user)
                          
                          // 检查认证状态
                          if (!user || !user.id) {
                            message.warning('请先登录')
                            // 跳转到登录页
                            window.location.href = '/login'
                            return
                          }

                          try {
                            console.log('开始免费阅读 - 用户ID:', user.id, '图书ID:', book.id)
                            
                            const coinService = (await import('../services/coins')).coinService
                            await coinService.readCarouselBook(user.id, book.id)
                            
                            message.success(`免费阅读成功！获得${COIN_CONFIG.DAILY_READ_BONUS}虚拟币奖励！`)
                            
                            message.success(`免费阅读成功！获得${COIN_CONFIG.DAILY_READ_BONUS}虚拟币奖励！`)
                            
                            // 跳转到阅读页面
                            window.location.href = `/read/${book.id}?free_read=true`
                          } catch (error: any) {
                            console.error('免费阅读失败:', error)
                            
                            // 如果是认证错误，提示重新登录
                            if (error.message?.includes('unauthorized') || 
                                error.message?.includes('authentication') ||
                                error.message?.includes('login') ||
                                error.message?.includes('user') ||
                                error.code === '401' ||
                                error.code === 'PGRST116') {
                              message.error('登录状态已过期，请重新登录')
                              // 清除本地状态并跳转到登录页
                              const { logout } = useAuthStore.getState()
                              await logout()
                              window.location.href = '/login'
                              return
                            }
                            
                            message.error(error.message || '阅读失败，请稍后重试')
                          }
                        }}
                      >
                        📖 免费阅读
                      </Button>
                    </div>
                    
                    {/* 图书封面 */}
                    <div style={{ flex: '0 0 180px' }}>
                      <BookCover
                        coverUrl={book.cover_image || book.cover_url}
                        title={book.title}
                        category={book.category}
                        width={180}
                        height={240}
                        style={{
                          border: '3px solid white',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <div style={{
                height: '300px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <BookOutlined style={{ fontSize: '64px', marginBottom: '20px' }} />
                  <h1 style={{ color: 'white', margin: '0 0 16px 0' }}>让知识传递温暖</h1>
                  <p style={{ color: 'white', opacity: 0.8 }}>公益二手书交流平台</p>
                  <Button 
                    type="primary"
                    size="large"
                    style={{
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      marginTop: '24px'
                    }}
                  >
                    <Link to="/books">开始探索</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Carousel>
      </section>

      {/* 统计数据区域 */}
      <section style={{padding: '60px 0', background: '#fafafa'}}>
        <div className="container">
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="总用户数"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="图书数量"
                  value={stats.totalBooks}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="交换次数"
                  value={stats.totalExchanges}
                  prefix={<SwapOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="阅读次数"
                  value={stats.totalReadings}
                  prefix={<ReadOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 功能介绍区域 */}
      <section style={{padding: '80px 0'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '60px'}}>
            <Title level={2} style={{
              fontSize: '36px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '16px'
            }}>平台特色功能</Title>
            <Paragraph style={{
              fontSize: '18px',
              color: '#666',
              lineHeight: '1.6'
            }}>
              为您提供全方位的图书交流体验
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={8}>
              <Card style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              hoverable
              className="feature">
                <BookOutlined style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '20px'
                }} />
                <Title level={4}>图书交换</Title>
                <Paragraph>
                  发布您的闲置图书，与其他书友进行交换，让每本书都找到新的主人
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              hoverable
              className="feature">
                <CrownOutlined style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '20px'
                }} />
                <Title level={4}>虚拟币系统</Title>
                <Paragraph>
                  通过签到、阅读推荐等方式获取虚拟币，用于图书交换和阅读
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              hoverable
              className="feature">
                <RobotOutlined style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '20px'
                }} />
                <Title level={4}>AI智能推荐</Title>
                <Paragraph>
                  基于您的阅读历史和偏好，AI为您量身推荐最适合的图书
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              hoverable
              className="feature">
                <CalendarOutlined style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '20px'
                }} />
                <Title level={4}>每日签到</Title>
                <Paragraph>
                  每日签到获得虚拟币奖励，阅读精选推荐图书还能获得额外奖励
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              hoverable
              className="feature">
                <ReadOutlined style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '20px'
                }} />
                <Title level={4}>在线阅读</Title>
                <Paragraph>
                  部分图书支持在线阅读，足不出户即可享受阅读的乐趣
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: '12px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              hoverable
              className="feature">
                <UserOutlined style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '20px'
                }} />
                <Title level={4}>社区交流</Title>
                <Paragraph>
                  与志同道合的书友交流心得，分享阅读体验，共同成长
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 精选图书区域 */}
      <section style={{padding: '80px 0', background: '#fafafa'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '60px'}}>
            <Title level={2} style={{
              fontSize: '36px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '16px'
            }}>精选图书</Title>
            <Paragraph style={{
              fontSize: '18px',
              color: '#666',
              lineHeight: '1.6'
            }}>
              为您推荐优质的二手图书
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {featuredBooks && featuredBooks.length > 0 ? (
              featuredBooks.slice(0, 6).map((book, index) => (
                <Col xs={24} sm={12} md={8} key={book.id}>
                  <Link to={`/books/${book.id}`} style={{display: 'block', height: '100%'}}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                      }}
                      cover={
                        <div style={{
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f5f5f5',
                          overflow: 'hidden'
                        }}>
                          {book.cover_image || book.cover_url ? (
                            <img 
                              src={book.cover_image || book.cover_url} 
                              alt={book.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              color: '#999'
                            }}>
                              <BookOutlined style={{fontSize: '48px', marginBottom: '8px'}} />
                              <span>暂无封面</span>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <Card.Meta
                        title={book.title}
                        description={
                          <div>
                            <p style={{marginBottom: '4px', color: '#666'}}>
                              作者：{book.author}
                            </p>
                            <p style={{marginBottom: '8px', color: '#999', fontSize: '12px'}}>
                              分类：{book.category}
                            </p>
                            <p style={{
                              color: '#faad14',
                              fontWeight: '500',
                              marginBottom: '0'
                            }}>
                              <CrownOutlined /> {book.exchange_coins} 币
                            </p>
                          </div>
                        }
                      />
                    </Card>
                  </Link>
                </Col>
              ))
            ) : (
              <Col span={24} style={{ textAlign: 'center', padding: '50px' }}>
                <Empty description="暂无精选图书" />
              </Col>
            )}
          </Row>

          <div className="section-footer">
            <Button type="primary" size="large">
              <Link to="/books">查看更多图书</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 用户引导区域 */}
      {!user && (
        <section style={{
          padding: '100px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="container">
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <Title level={2} style={{
                color: 'white !important',
                fontSize: '36px !important',
                fontWeight: '600 !important',
                marginBottom: '20px !important'
              }}>
                开启您的阅读之旅
              </Title>
              <Paragraph style={{
                color: 'white !important',
                opacity: 0.9,
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '40px !important'
              }}>
                立即注册，获得50虚拟币奖励，免费享受海量优质图书资源
              </Paragraph>
              <Space size="large">
                <Button 
                  type="primary" 
                  size="large" 
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px',
                    borderRadius: '24px',
                    background: 'white !important',
                    color: '#1890ff !important',
                    border: 'none !important'
                  }}
                >
                  <Link to="/register">立即注册</Link>
                </Button>
                <Button 
                  size="large" 
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px',
                    borderRadius: '24px',
                    border: '2px solid white !important',
                    color: 'white !important',
                    background: 'transparent !important'
                  }}
                >
                  <Link to="/books">先看看</Link>
                </Button>
              </Space>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home