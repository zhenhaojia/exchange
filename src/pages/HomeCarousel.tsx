// 简单的轮播图组件
import React from 'react'
import { Carousel } from 'antd'
import { BookOutlined, CrownOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import { Book } from '../types'

interface HomeCarouselProps {
  books: Book[]
}

const HomeCarousel: React.FC<HomeCarouselProps> = ({ books }) => {
  console.log('🎠 轮播图组件接收到图书数据:', books)

  if (!books || books.length === 0) {
    return (
      <div style={{
        height: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <BookOutlined style={{ fontSize: '64px', marginBottom: '20px' }} />
          <h2 style={{ color: 'white', marginBottom: '16px' }}>让知识传递温暖</h2>
          <p style={{ color: 'white', opacity: 0.8 }}>公益二手书交流平台</p>
        </div>
      </div>
    )
  }

  return (
    <Carousel autoplay style={{
      height: '400px',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {books.map((book, index) => {
        console.log(`📖 渲染轮播图第${index + 1}项:`, book.title)
        
        return (
          <div key={book.id} style={{
            height: '400px',
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
              {/* 左侧信息 */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>今日推荐</div>
                
                <h2 style={{
                  color: 'white',
                  margin: '10px 0',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>{book.title}</h2>
                
                <p style={{
                  color: 'white',
                  opacity: 0.9,
                  margin: '10px 0',
                  fontSize: '18px'
                }}>作者：{book.author}</p>
                
                <p style={{
                  color: 'white',
                  opacity: 0.8,
                  margin: '15px 0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{book.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
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
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '20px',
                    height: '40px',
                    fontSize: '16px'
                  }}
                >
                  <Link to={`/books/${book.id}`}>立即阅读</Link>
                </Button>
              </div>
              
              {/* 右侧封面 */}
              <div style={{ flex: '0 0 180px' }}>
                {(book.cover_image || book.cover_url) ? (
                  <img 
                    src={book.cover_image || book.cover_url}
                    alt={book.title}
                    style={{
                      width: '180px',
                      height: '250px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '3px solid white',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }}
                    onError={(e) => {
                      console.error('❌ 封面加载失败:', book.title)
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                
                {/* 备用显示 */}
                <div style={{
                  width: '180px',
                  height: '250px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  display: (book.cover_image || book.cover_url) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'white',
                  border: '2px dashed rgba(255,255,255,0.5)'
                }}>
                  <BookOutlined style={{ fontSize: '40px', marginBottom: '10px' }} />
                  <span style={{ fontSize: '14px' }}>暂无封面</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </Carousel>
  )
}

export default HomeCarousel