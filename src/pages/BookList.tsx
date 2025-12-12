import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Pagination, 
  Space, 
  Spin,
  Empty,
  Slider
} from 'antd'
import { 
  SearchOutlined, 
  BookOutlined, 
  CrownOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { bookService } from '../services/books'
import { Book, BookFilters } from '../types'
import { BOOK_CATEGORIES, BOOK_CONDITIONS } from '../constants'
import BookCover from '../components/BookCover'
import './BookList.css'

const { Option } = Select
const { Search } = Input

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [filters, setFilters] = useState<BookFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const result = await bookService.getBooks(filters, { page: current, limit: pageSize })
      setBooks(result.books)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [current, pageSize, filters])

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value })
    setCurrent(1)
  }

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value || undefined })
    setCurrent(1)
  }

  const handleConditionChange = (value: string) => {
    setFilters({ ...filters, condition: value || undefined })
    setCurrent(1)
  }

  const handlePriceRangeChange = (value: [number, number]) => {
    setFilters({ 
      ...filters, 
      min_coins: value[0] > 0 ? value[0] : undefined,
      max_coins: value[1] < 200 ? value[1] : undefined
    })
    setCurrent(1)
  }

  const handleReset = () => {
    setFilters({})
    setCurrent(1)
  }

  const getConditionLabel = (condition: string) => {
    const found = BOOK_CONDITIONS.find(c => c.value === condition)
    return found ? found.label : condition
  }

  return (
    <div className="book-list">
      <div className="container">
        {/* 搜索和筛选区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="search-section"
        >
          <Card className="search-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="搜索书名或作者"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </Col>
              
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="选择分类"
                  allowClear
                  size="large"
                  style={{ width: '100%' }}
                  value={filters.category}
                  onChange={handleCategoryChange}
                >
                  {BOOK_CATEGORIES.map(category => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="品相要求"
                  allowClear
                  size="large"
                  style={{ width: '100%' }}
                  value={filters.condition}
                  onChange={handleConditionChange}
                >
                  {BOOK_CONDITIONS.map(condition => (
                    <Option key={condition.value} value={condition.value}>
                      {condition.label}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Space>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="large"
                  >
                    {showFilters ? '收起筛选' : '更多筛选'}
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    size="large"
                  >
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* 扩展筛选条件 */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="extended-filters"
              >
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={12}>
                    <div className="price-filter">
                      <label>虚拟币范围：</label>
                      <Slider
                        range
                        min={0}
                        max={200}
                        step={5}
                        marks={{ 0: '0', 50: '50', 100: '100', 150: '150', 200: '200+' }}
                        value={[
                          filters.min_coins || 0,
                          filters.max_coins || 200
                        ]}
                        onChange={handlePriceRangeChange}
                      />
                    </div>
                  </Col>
                </Row>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* 统计信息 */}
        <div className="stats-info">
          <span>共找到 {total} 本图书</span>
          {filters.search && <span> · 关键词：{filters.search}</span>}
          {filters.category && <span> · 分类：{filters.category}</span>}
        </div>

        {/* 图书列表 */}
        <Spin spinning={loading}>
          {books.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="books-grid"
            >
              <Row gutter={[24, 24]}>
                {books.map((book, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link to={`/books/${book.id}`}>
                        <Card
                          hoverable
                          className="book-card"
                          cover={
                            <BookCover
                              coverUrl={book.cover_image || book.cover_url}
                              title={book.title}
                              category={book.category}
                              width={200}
                              height={250}
                            />
                          }
                        >
                          <Card.Meta
                            title={
                              <div className="book-title" title={book.title}>
                                {book.title}
                              </div>
                            }
                            description={
                              <div className="book-info">
                                <p className="book-author">作者：{book.author}</p>
                                <p className="book-category">分类：{book.category}</p>
                                <p className="book-condition">
                                  品相：{getConditionLabel(book.condition)}
                                </p>
                                <div className="book-footer">
                                  <span className="book-coins">
                                    <CrownOutlined /> {book.exchange_coins} 币
                                  </span>
                                  <span className="book-exchange-count">
                                    已交换 {book.exchange_count} 次
                                  </span>
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </Link>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          ) : (
            !loading && (
              <Empty
                description="暂无符合条件的图书"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '60px 0' }}
              />
            )
          )}
        </Spin>

        {/* 分页 */}
        {total > 0 && (
          <div className="pagination-container">
            <Pagination
              current={current}
              total={total}
              pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `第 ${range[0]}-${range[1]} 本，共 ${total} 本`
              }
              onChange={(page, size) => {
                setCurrent(page)
                setPageSize(size || 12)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BookList