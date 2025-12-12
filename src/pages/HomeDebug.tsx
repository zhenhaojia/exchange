import React from 'react'
import { Card, Row, Col, Typography } from 'antd'
import { BookOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const HomeDebug: React.FC = () => {
  // 简单的调试版本，直接显示图书信息
  const [books, setBooks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('https://bnvplojnzfmoupdgtpch.supabase.co/rest/v1/books?select=*&status=eq.available&limit=6', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudnBsb2puemZtb3VwZGd0cGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDkzNzIsImV4cCI6MjA4MDM4NTM3Mn0.UJb4xhZ04vLcf9IhGoCpKa7S1fec4G39trFcrAnVHnk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudnBsb2puemZtb3VwZGd0cGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDkzNzIsImV4cCI6MjA4MDM4NTM3Mn0.UJb4xhZ04vLcf9IhGoCpKa7S1fec4G39trFcrAnVHnk'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('调试 - 直接获取的图书数据:', data)
        setBooks(data)
      })
      .catch(error => console.error('调试 - 获取数据错误:', error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>调试页面 - 图书数据显示</Title>
      
      <Title level={3}>获取到的数据: {books.length} 本图书</Title>
      
      <Row gutter={[16, 16]}>
        {books.map((book, index) => (
          <Col xs={24} sm={12} md={8} key={book.id}>
            <Card 
              key={book.id}
              style={{ marginBottom: '16px' }}
              title={book.title}
            >
              <p><strong>ID:</strong> {book.id}</p>
              <p><strong>作者:</strong> {book.author}</p>
              <p><strong>分类:</strong> {book.category}</p>
              <p><strong>虚拟币:</strong> {book.exchange_coins}</p>
              <p><strong>状态:</strong> {book.status}</p>
              <p><strong>封面:</strong> {book.cover_url || '无封面'}</p>
              <p><strong>标签:</strong> {JSON.stringify(book.tags)}</p>
              <p><strong>创建时间:</strong> {book.created_at}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default HomeDebug