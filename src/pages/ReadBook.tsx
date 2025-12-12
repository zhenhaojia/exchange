import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Spin,
  message,
  Space,
  Tag,
  Divider
} from 'antd'
import { 
  ArrowLeftOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { bookService } from '../services/books'
import { bookContentService, BookContent } from '../services/bookContent'
import { Book } from '../types'
import './ReadBook.css'

const { Title, Paragraph, Text } = Typography

const ReadBook: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [book, setBook] = useState<Book | null>(null)
  const [bookContent, setBookContent] = useState<BookContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFreeRead, setIsFreeRead] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // 并行获取图书信息和内容
        const [bookData, contentData] = await Promise.all([
          bookService.getBookById(id),
          bookContentService.getBookContent(id)
        ])
        
        setBook(bookData)
        setBookContent(contentData)
      } catch (error: any) {
        message.error(error.message || '获取图书信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id])

  useEffect(() => {
    // 检查是否是免费阅读
    const urlParams = new URLSearchParams(window.location.search)
    setIsFreeRead(urlParams.get('free_read') === 'true')
  }, [])

  // 移除所有认证检查，完全依赖ProtectedRoute
  // 用户认证状态由ProtectedRoute统一管理

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#666' }}>加载图书内容...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px' 
      }}>
        <Title level={3}>图书不存在</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
        >
          返回首页
        </Button>
      </div>
    )
  }

  return (
    <div className="read-book-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* 头部导航 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </Col>
        <Col>
          <Space>
            <Tag color={isFreeRead ? 'green' : 'blue'}>
              {isFreeRead ? '免费阅读' : '付费阅读'}
            </Tag>
          </Space>
        </Col>
      </Row>

      {/* 图书信息卡片 */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{
                  width: '100%',
                  height: '280px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9'
                }}
              >
                <BookOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '10px' }} />
                <Text type="secondary">图书封面</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Title level={3}>{book.title}</Title>
            <Paragraph>
              <Text strong>作者：</Text>{book.author}
            </Paragraph>
            <Paragraph>
              <Text strong>分类：</Text>{book.category}
            </Paragraph>
            {book.tags && book.tags.length > 0 && (
              <Paragraph>
                <Text strong>标签：</Text>
                {book.tags.map((tag, index) => (
                  <Tag key={index} style={{ marginLeft: '4px' }}>{tag}</Tag>
                ))}
              </Paragraph>
            )}
          </Col>
        </Row>
      </Card>

      {/* 阅读内容区域 */}
      <Card title="图书内容" style={{ marginBottom: '20px' }}>
        {isFreeRead ? (
          <div>
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #91d5ff'
            }}>
              <BookOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4} type="success">🎉 免费阅读成功！</Title>
              <Paragraph>
                您已成功获得此书的免费阅读权限。这是通过首页轮播图获得的特别奖励！
              </Paragraph>
              <Paragraph>
                <Text strong>图书名称：</Text>{book.title}
              </Paragraph>
              <Paragraph>
                <Text strong>图书描述：</Text>{book.description}
              </Paragraph>
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: '#fff2f0',
            borderRadius: '8px',
            border: '1px solid #ffccc7'
          }}>
            <Title level={4} type="warning">需要虚拟币</Title>
              <Paragraph>
                阅读完整内容需要花费5个虚拟币。请返回图书详情页进行付费阅读。
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                返回图书详情页
              </Button>
            </div>
          )}
        </Card>

      {/* 实际阅读区域 */}
      {bookContent ? (
        <Card title={`目录 (${bookContent.chapters.length}章)`}>
          <div className="reading-content">
            {bookContent.chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                className="chapter-content-card"
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <div className="chapter-header">
                  <Title level={5}>
                    第{chapter.chapter_number}章：{chapter.chapter_title}
                  </Title>
                  <Text type="secondary">
                    {chapter.word_count}字 · 预计阅读{chapter.reading_time}分钟
                  </Text>
                </div>
                <Divider />
                <div className="chapter-text">
                  <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                    {chapter.content}
                  </Paragraph>
                </div>
              </Card>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text type="secondary">
              总字数：{bookContent.total_words} · 预计总阅读时间：{bookContent.total_reading_time}分钟
            </Text>
          </div>
        </Card>
      ) : (
        <Card title="阅读区域" style={{ textAlign: 'center' }}>
          <div style={{ 
            padding: '40px 20px',
            backgroundColor: '#fafafa',
            borderRadius: '8px'
          }}>
            <BookOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4}>📖 暂无阅读内容</Title>
            <Paragraph>
              该图书暂未上传阅读内容，请稍后再试。
            </Paragraph>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ReadBook