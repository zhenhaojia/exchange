import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Button, Statistic, Empty } from 'antd'
import { Link } from 'react-router-dom'
import { 
  BookOutlined, 
  UserOutlined, 
  CrownOutlined,
  CalendarOutlined,
  ReadOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { bookService } from '../services/books'
import { statsService } from '../services/stats'
import { Book } from '../types'
import HomeCarousel from './HomeCarousel'

const { Title, Paragraph } = Typography

const HomeClean: React.FC = () => {
  const { user } = useAuthStore()
  const { coins } = useCoinStore()
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

        console.log('📊 获取到的数据:', {
          stats: statsData,
          featuredBooks: featuredData.books,
          popularBooks: popularData,
          latestBooks: latestData,
          dailyRecommendations: dailyData
        })

        setStats(statsData)
        setFeaturedBooks(featuredData.books || [])
        setPopularBooks(popularData || [])
        setLatestBooks(latestData || [])
        setDailyRecommendations(dailyData || [])
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
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 调试信息 */}
      <div style={{
        background: '#f0f0f0',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>🔍 清理版调试信息</h3>
        <p>loading: {loading ? '是' : '否'}</p>
        <p>dailyRecommendations数量: {dailyRecommendations.length}</p>
        <p>第一本书: {dailyRecommendations[0]?.title || '无'}</p>
        {dailyRecommendations[0] && (
          <p>第一本书封面: {dailyRecommendations[0].cover_image || dailyRecommendations[0].cover_url || '无'}</p>
        )}
      </div>

      {/* 轮播图区域 - 每日推荐图书 */}
      <section style={{ marginBottom: '60px' }}>
        <HomeCarousel books={dailyRecommendations} />
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
                  prefix={<ReadOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 精选图书区域 */}
      <section style={{padding: '80px 0', background: '#fafafa'}}>
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
            {featuredBooks && featuredBooks.length > 0 ? (
              featuredBooks.slice(0, 6).map((book, index) => (
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
              ))
            ) : (
              <Col span={24} style={{ textAlign: 'center', padding: '50px' }}>
                <Empty description="暂无精选图书" />
              </Col>
            )}
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

export default HomeClean