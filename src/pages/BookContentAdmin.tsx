import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Divider
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SaveOutlined,
  BookOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { bookService } from '../services/books'
import { bookContentService, BookChapter, BookContent } from '../services/bookContent'
import './BookContentAdmin.css'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const BookContentAdmin: React.FC = () => {
  const { user } = useAuthStore()
  const [books, setBooks] = useState<any[]>([])
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [bookContent, setBookContent] = useState<BookContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingChapter, setEditingChapter] = useState<BookChapter | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (selectedBook) {
      fetchBookContent(selectedBook.id)
    }
  }, [selectedBook])

  const fetchBooks = async () => {
    try {
      const { books } = await bookService.getBooks({}, { page: 1, limit: 50 })
      setBooks(books)
    } catch (error) {
      message.error('获取图书列表失败')
    }
  }

  const fetchBookContent = async (bookId: string) => {
    setLoading(true)
    try {
      const content = await bookContentService.getBookContent(bookId)
      setBookContent(content)
    } catch (error) {
      message.error('获取图书内容失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddChapter = () => {
    setEditingChapter(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditChapter = (chapter: BookChapter) => {
    setEditingChapter(chapter)
    form.setFieldsValue(chapter)
    setModalVisible(true)
  }

  const handleSaveChapter = async (values: any) => {
    try {
      if (editingChapter) {
        // 更新章节
        await bookContentService.updateBookContent(editingChapter.id, values)
        message.success('章节更新成功')
      } else {
        // 新增章节
        await bookContentService.createBookContent({
          ...values,
          book_id: selectedBook.id
        })
        message.success('章节添加成功')
      }
      
      setModalVisible(false)
      await fetchBookContent(selectedBook.id)
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleDeleteChapter = async (chapter: BookChapter) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除章节"${chapter.chapter_title}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await bookContentService.deleteBookContent(chapter.id)
          message.success('章节删除成功')
          await fetchBookContent(selectedBook.id)
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  return (
    <div className="book-content-admin">
      <Title level={2}>图书内容管理</Title>
      <Paragraph>
        在这里管理图书的章节内容，支持完整的在线阅读功能。
      </Paragraph>

      {/* 图书选择 */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>选择图书</Title>
        <Row gutter={[16, 16]}>
          {books.map(book => (
            <Col xs={12} sm={8} md={6} key={book.id}>
              <Card
                hoverable
                className={`book-selector ${selectedBook?.id === book.id ? 'selected' : ''}`}
                onClick={() => setSelectedBook(book)}
              >
                <div className="book-card-content">
                  <BookOutlined className="book-icon" />
                  <Text strong>{book.title}</Text>
                  <br />
                  <Text type="secondary">{book.author}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 章节管理 */}
      {selectedBook && bookContent && (
        <Card>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <Title level={4}>{selectedBook.title} - 章节管理</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddChapter}
            >
              添加章节
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {bookContent.chapters.map(chapter => (
              <Col xs={24} sm={12} md={8} key={chapter.id}>
                <Card
                  className="chapter-card"
                  actions={[
                    <EditOutlined 
                      key="edit" 
                      onClick={() => handleEditChapter(chapter)}
                    />,
                    <DeleteOutlined 
                      key="delete" 
                      onClick={() => handleDeleteChapter(chapter)}
                    />
                  ]}
                >
                  <div className="chapter-content">
                    <Title level={5}>{chapter.chapter_title}</Title>
                    <Paragraph ellipsis={{ rows: 3 }}>
                      {chapter.content}
                    </Paragraph>
                    <div className="chapter-meta">
                      <Text type="secondary">
                        第{chapter.chapter_number}章 | {chapter.word_count}字 | 约{chapter.reading_time}分钟
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 章节编辑模态框 */}
      <Modal
        title={editingChapter ? '编辑章节' : '添加章节'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveChapter}
        >
          <Form.Item
            name="chapter_number"
            label="章节序号"
            rules={[{ required: true, message: '请输入章节序号' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="chapter_title"
            label="章节标题"
            rules={[{ required: true, message: '请输入章节标题' }]}
          >
            <Input placeholder="请输入章节标题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="章节内容"
            rules={[{ required: true, message: '请输入章节内容' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="请输入章节内容，支持换行和分段"
            />
          </Form.Item>
          
          <Form.Item
            name="word_count"
            label="字数（可选）"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="reading_time"
            label="预计阅读时间（分钟）"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BookContentAdmin