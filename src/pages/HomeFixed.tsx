import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Button, Statistic, Carousel, message } from 'antd'
import { Link } from 'react-router-dom'
import { 
  BookOutlined, 
  UserOutlined, 
  CrownOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { bookService } from '../services/books'
import { statsService } from '../services/stats'
import { Book } from '../types'
import { COIN_CONFIG } from '../constants'

const { Title, Paragraph } = Typography

const HomeFixed: React.FC = () => {
  const { user } = useAuthStore()
  const { coins } = useCoinStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalExchanges: 0,
    totalReadings: 0
  })
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [dailyRecommendations, setDailyRecommendations] = useState<Book[]>([])
  const [carouselBooks, setCarouselBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 开始获取首页数据...')
        
        const [statsData, featuredData, dailyData] = await Promise.all([
          statsService.getStats(),
          bookService.getBooks({}, { page: 1, limit: 6 }),
          statsService.getDailyRecommendations(3)
        ])

        console.log('📊 获取到的数据:', {
          stats: statsData,
          featuredBooks: featuredData.books,
          dailyRecommendations: dailyData
        })

        setStats(statsData)
        setFeaturedBooks(featuredData.books || [])
        setDailyRecommendations(dailyData || [])
        
        // 设置轮播图书：如果每日推荐少于3本，用精选图书补充
        const dailyBooks = dailyData || []
        const additionalBooks = featuredData?.books?.filter(
          book => !dailyBooks.some(dailyBook => dailyBook.id === book.id)
        ).slice(0, 3 - dailyBooks.length) || []
        
        setCarouselBooks([...dailyBooks, ...additionalBooks])
      } catch (error) {
        console.error('❌ 获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  console.log('🔄 组件渲染状态:', { 
    loading, 
    dailyRecommendationsCount: dailyRecommendations.length,
    firstBookTitle: dailyRecommendations[0]?.title 
  })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        <p style={{ marginTop: '16px', color: '#666' }}>加载首页数据中...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* 调试信息 */}
      <div style={{
        background: '#f0f0f0',
        padding: '15px',
        margin: '20px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>🔍 修复版调试信息</h3>
        <p>📊 loading: {loading ? '是' : '否'}</p>
        <p>📚 dailyRecommendations数量: {dailyRecommendations.length}</p>
        <p>📖 第一本书: {dailyRecommendations[0]?.title || '无'}</p>
        {dailyRecommendations[0] && (
          <p>🖼️ 封面: {dailyRecommendations[0].cover_image || dailyRecommendations[0].cover_url || '无'}</p>
        )}
      </div>

      {/* 轮播图区域 */}
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
                    if (!user) {
                      message.info('请先登录')
                      return
                    }

                    try {
                      const coinService = (await import('../services/coins')).coinService
                      await coinService.readCarouselBook(user.id, book.id)
                      
                      message.success(`免费阅读成功！获得${COIN_CONFIG.DAILY_READ_BONUS}虚拟币奖励！`)
                      
                      // 跳转到图书详情页
                      window.location.href = `/books/${book.id}`
                    } catch (error: any) {
                      message.error(error.message || '阅读失败，请稍后重试')
                    }
                  }}
                >
                  📖 免费阅读
                </Button>
                    </div>
                    
                    {/* 图书封面 */}
                    <div style={{ flex: '0 0 180px' }}>
                      {(book.cover_image || book.cover_url) ? (
                        <img 
                          src={book.cover_image || book.cover_url}
                          alt={book.title}
                          style={{
                            width: '180px',
                            height: '240px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '3px solid white',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                          }}
                          onError={(e) => {
                            console.error('❌ 封面加载失败:', book.title)
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '180px',
                          height: '240px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed rgba(255,255,255,0.5)'
                        }}>
                          <BookOutlined style={{ fontSize: '40px', color: 'white' }} />
                        </div>
                      )}
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
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <Card style={{textAlign: 'center', borderRadius: '12px'}}>
                <Statistic
                  title="总用户数"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{textAlign: 'center', borderRadius: '12px'}}>
                <Statistic
                  title="图书数量"
                  value={stats.totalBooks}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{textAlign: 'center', borderRadius: '12px'}}>
                <Statistic
                  title="交换次数"
                  value={stats.totalExchanges}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{textAlign: 'center', borderRadius: '12px'}}>
                <Statistic
                  title="阅读次数"
                  value={stats.totalReadings}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 精选图书区域 */}
      <section style={{padding: '80px 0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
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
            {featuredBooks.slice(0, 6).map((book, index) => (
              <Col xs={24} sm={12} md={8} key={book.id}>
                <Link to={`/books/${book.id}`} style={{display: 'block', height: '100%'}}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                    cover={
                      <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5'
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
            ))}
          </Row>

          <div style={{textAlign: 'center', marginTop: '40px'}}>
            <Button type="primary" size="large">
              <Link to="/books">查看更多图书</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomeFixed