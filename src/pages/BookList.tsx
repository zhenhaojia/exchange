import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Box,
  Pagination,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Rating
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart as CartIcon,
  ExpandMore as ExpandMoreIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  condition: string;
  category: string;
  seller: string;
  location: string;
  stock: number;
}

const BookList = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(10)

  // 筛选状态
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    condition: '',
    priceRange: [0, 500],
    sortBy: 'newest',
    inStock: true
  })
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // 模拟图书数据
  const allBooks: Book[] = [
    {
      id: 1,
      title: 'JavaScript高级程序设计',
      author: 'Nicholas C. Zakas',
      price: 35.0,
      originalPrice: 89.0,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
      rating: 4.8,
      reviews: 156,
      condition: '九成新',
      category: '计算机科学',
      seller: '张同学',
      location: '北京',
      stock: 2
    },
    {
      id: 2,
      title: '深入理解计算机系统',
      author: 'Randal E. Bryant',
      price: 45.0,
      originalPrice: 99.0,
      image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300&h=400&fit=crop',
      rating: 4.9,
      reviews: 234,
      condition: '八成新',
      category: '计算机科学',
      seller: '李教授',
      location: '上海',
      stock: 1
    },
    {
      id: 3,
      title: '算法导论',
      author: 'Thomas H. Cormen',
      price: 55.0,
      originalPrice: 128.0,
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
      rating: 4.7,
      reviews: 189,
      condition: '七成新',
      category: '计算机科学',
      seller: '王程序员',
      location: '深圳',
      stock: 3
    }
  ]

  const categories = ['全部', '计算机科学', '文学小说', '经管励志', '外语学习', '生活百科', '教材教辅']
  const conditions = ['全部', '全新', '九成新', '八成新', '七成新', '六成新以下']
  const sortOptions = [
    { value: 'newest', label: '最新发布' },
    { value: 'price_low', label: '价格从低到高' },
    { value: 'price_high', label: '价格从高到低' },
    { value: 'rating', label: '评分最高' },
    { value: 'popular', label: '最热门' }
  ]

  useEffect(() => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      let filteredBooks = allBooks

      // 搜索筛选
      if (filters.search) {
        filteredBooks = filteredBooks.filter(book =>
          book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          book.author.toLowerCase().includes(filters.search.toLowerCase())
        )
      }

      // 分类筛选
      if (filters.category && filters.category !== '全部') {
        filteredBooks = filteredBooks.filter(book => book.category === filters.category)
      }

      // 成色筛选
      if (filters.condition && filters.condition !== '全部') {
        filteredBooks = filteredBooks.filter(book => book.condition === filters.condition)
      }

      // 价格筛选
      filteredBooks = filteredBooks.filter(book => 
        book.price >= filters.priceRange[0] && book.price <= filters.priceRange[1]
      )

      // 库存筛选
      if (filters.inStock) {
        filteredBooks = filteredBooks.filter(book => book.stock > 0)
      }

      // 排序
      switch (filters.sortBy) {
        case 'price_low':
          filteredBooks.sort((a, b) => a.price - b.price)
          break
        case 'price_high':
          filteredBooks.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filteredBooks.sort((a, b) => b.rating - a.rating)
          break
        default:
          // newest - 保持原顺序
          break
      }

      setBooks(filteredBooks)
      setLoading(false)
    }, 300)
  }, [filters.search, filters.category, filters.condition, filters.priceRange, filters.sortBy, filters.inStock])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const addToCart = (book: Book) => {
    console.log('添加到购物车:', book.title)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 搜索和筛选栏 */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <input
              placeholder="搜索图书名称、作者..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilterDrawerOpen(true)}
            >
              筛选
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 图书列表 */}
      <Typography variant="h5" gutterBottom>
        共找到 {books.length} 本图书
      </Typography>

      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
            <div
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                opacity: book.stock === 0 ? 0.6 : 1
              }}
              onClick={() => navigate(`/books/${book.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  height: 200,
                  backgroundImage: `url(${book.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                  <span
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {book.condition}
                  </span>
                  {book.stock === 0 && (
                    <span
                      style={{
                        backgroundColor: 'rgba(244, 67, 54, 0.9)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      已售罄
                    </span>
                  )}
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <h6 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {book.title}
                </h6>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  {book.author}
                </p>
                <span style={{ fontSize: '12px', color: '2E7D32', display: 'block', marginBottom: '8px' }}>
                  {book.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Rating value={book.rating} precision={0.1} size="small" readOnly />
                  <span style={{ marginLeft: '4px', fontSize: '12px', color: '#666' }}>
                    ({book.reviews})
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                  卖家: {book.seller} · {book.location}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '18px', color: '#2E7D32', fontWeight: 'bold' }}>
                      ¥{book.price}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        textDecoration: 'line-through',
                        marginLeft: '8px'
                      }}
                    >
                      ¥{book.originalPrice}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#FF6B35',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {Math.round((1 - book.price / book.originalPrice) * 100)}%
                  </span>
                </div>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={book.stock === 0}
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart(book)
                  }}
                  style={{
                    backgroundColor: book.stock === 0 ? '#ccc' : '#2E7D32',
                    color: 'white'
                  }}
                >
                  {book.stock === 0 ? '已售罄' : '加入购物车'}
                </Button>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* 分页 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Container>
  )
}

export default BookList