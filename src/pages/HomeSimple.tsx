import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Button, Carousel, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { 
  BookOutlined, 
  CrownOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { bookService } from '../services/books'
import { statsService } from '../services/stats'
import { Book } from '../types'

const { Title, Paragraph } = Typography

const HomeSimple: React.FC = () => {
  const { user } = useAuthStore()
  const [dailyRecommendations, setDailyRecommendations] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log('🚀 开始获取每日推荐...')
        const recommendations = await statsService.getDailyRecommendations(3)
        console.log('📚 获取到的推荐图书:', recommendations)
        
        if (recommendations && recommendations.length > 0) {
          setDailyRecommendations(recommendations)
        } else {
          console.log('⚠️ 没有获取到推荐图书，使用featuredBooks作为备选')
          // 如果没有推荐，使用featuredBooks
          const featuredData = await bookService.getBooks({}, { page: 1, limit: 3 })
          setDailyRecommendations(featuredData.books || [])
        }
      } catch (err) {
        console.error('❌ 获取推荐失败:', err)
        setError('获取推荐图书失败')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  console.log('🔄 组件重新渲染，dailyRecommendations:', dailyRecommendations)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p>加载推荐图书中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <p style={{ color: 'red' }}>{error}</p>
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
        <h3>🔍 调试信息</h3>
        <p>推荐图书数量: {dailyRecommendations.length}</p>
        <p>第一本书: {dailyRecommendations[0]?.title || '无'}</p>
        {dailyRecommendations[0] && (
          <p>第一本书封面: {dailyRecommendations[0].cover_image || dailyRecommendations[0].cover_url || '无'}</p>
        )}
      </div>

      {/* 简单轮播图 */}
      <Carousel autoplay style={{ height: '300px', marginBottom: '40px' }}>
        {dailyRecommendations.map((book, index) => {
          console.log(`📖 渲染图书 ${index + 1}:`, book.title)
          
          return (
            <div key={book.id} style={{
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
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: 'white', margin: '0 0 10px 0' }}>
                    {book.title}
                  </h2>
                  <p style={{ color: 'white', opacity: 0.9, margin: '0 0 15px 0' }}>
                    作者：{book.author}
                  </p>
                  <Button 
                    type="primary"
                    style={{ background: 'white', color: '#667eea', border: 'none' }}
                  >
                    <Link to={`/books/${book.id}`}>查看详情</Link>
                  </Button>
                </div>
                
                {/* 图书封面 */}
                <div style={{ flex: '0 0 150px' }}>
                  {(book.cover_image || book.cover_url) ? (
                    <img 
                      src={book.cover_image || book.cover_url}
                      alt={book.title}
                      style={{
                        width: '150px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '3px solid white',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }}
                      onError={(e) => {
                        console.error('❌ 图片加载失败:', book.title)
                        const target = e.currentTarget
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '150px',
                      height: '200px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'white',
                      border: '2px dashed white'
                    }}>
                      <BookOutlined style={{ fontSize: '40px', marginBottom: '10px' }} />
                      <span>暂无封面</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </Carousel>

      {/* 简单图书列表 */}
      <h2>📚 推荐图书列表</h2>
      <Row gutter={[16, 16]}>
        {dailyRecommendations.map(book => (
          <Col span={8} key={book.id}>
            <Card 
              hoverable
              cover={
                (book.cover_image || book.cover_url) ? (
                  <img 
                    src={book.cover_image || book.cover_url}
                    alt={book.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5'
                  }}>
                    <BookOutlined style={{ fontSize: '40px', color: '#ccc' }} />
                  </div>
                )
              }
            >
              <Card.Meta
                title={book.title}
                description={`作者：${book.author}`}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default HomeSimple