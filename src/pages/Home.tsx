import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CardMedia,
  Chip,
  Rating,
  Stack,
  Paper,
  Avatar,
  LinearProgress,
  Fade,
  Slide,
  Skeleton
} from '@mui/material'
import {
  ArrowForward as ArrowIcon,
  LocalShipping as ShippingIcon,
  VerifiedUser as VerifiedIcon,
  AttachMoney as MoneyIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { booksAPI } from '../services/api'

const Home = () => {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setVisible(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 获取图书数据
      const booksResponse = await booksAPI.getBooks({ limit: 4 })
      
      // 模拟分类数据（暂时使用静态数据，因为SQLite版本的分类API可能未实现）
      const fallbackCategories = [
        { name: '计算机科技', count: 1234, icon: '💻', color: '#2196F3' },
        { name: '文学小说', count: 892, icon: '📚', color: '#4CAF50' },
        { name: '经济管理', count: 656, icon: '📈', color: '#FF9800' },
        { name: '外语学习', count: 445, icon: '🌍', color: '#9C27B0' },
        { name: '生活休闲', count: 334, icon: '🏠', color: '#00BCD4' },
        { name: '教材教辅', count: 567, icon: '🎓', color: '#795548' }
      ]
      
      // 处理图书数据
      const processedBooks = booksResponse.data.books.map((book: any) => {
        let imageUrl = `https://via.placeholder.com/300x400/4CAF50/ffffff?text=${encodeURIComponent(book.title)}`;
        
        // 处理图片字段
        if (book.images) {
          try {
            const images = typeof book.images === 'string' ? JSON.parse(book.images) : book.images;
            if (images && images.length > 0) {
              imageUrl = images[0];
            }
          } catch (e) {
            console.warn('图片数据解析失败:', book.images);
          }
        }
        
        return {
          ...book,
          originalPrice: book.original_price || 0,
          price: book.selling_price,
          condition: book.condition_level,
          discount: book.original_price ? Math.round((1 - book.selling_price / book.original_price) * 100) : 0,
          reviews: Math.floor(Math.random() * 200) + 50, // 模拟评价数，后续可从评价API获取
          image: imageUrl
        };
      })

      setFeaturedBooks(processedBooks.slice(0, 4))
      setCategories(fallbackCategories)
    } catch (error) {
      console.error('获取数据失败:', error)
      // 如果API失败，使用完全模拟的数据
      const fallbackBooks = [
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
          discount: 61
        }
      ]
      setFeaturedBooks(fallbackBooks)
      setCategories(fallbackCategories)
    } finally {
      setLoading(false)
    }
  }

  // 处理分类数据，添加图标和颜色
  const categoryIcons: { [key: string]: string } = {
    '计算机科技': '💻',
    '文学小说': '📚',
    '经济管理': '📈',
    '教材教辅': '🎓',
    '计算机科学': '💻',
    '外语学习': '🌍',
    '生活休闲': '🏠',
    '生活百科': '🏠',
    '艺术设计': '🎨',
    '历史传记': '📜',
    '少儿读物': '👶',
    '考试考证': '📝',
    '其他': '📦'
  }

  const categoryColors: { [key: string]: string } = {
    '计算机科技': '#2196F3',
    '文学小说': '#4CAF50',
    '经济管理': '#FF9800',
    '教材教辅': '#795548',
    '计算机科学': '#2196F3',
    '外语学习': '#9C27B0',
    '生活休闲': '#00BCD4',
    '生活百科': '#00BCD4',
    '艺术设计': '#E91E63',
    '历史传记': '#795548',
    '少儿读物': '#FF9800',
    '考试考证': '#F44336',
    '其他': '#607D8B'
  }

  const processedCategories = categories.map((category: any) => ({
    ...category,
    icon: categoryIcons[category.name] || '📦',
    color: categoryColors[category.name] || '#607D8B',
    count: Math.floor(Math.random() * 1000) + 100 // 模拟数量，后续可从API获取
  }))

  const features = [
    {
      icon: VerifiedIcon,
      title: '正品保障',
      description: '所有图书经过严格审核，确保品质可靠'
    },
    {
      icon: ShippingIcon,
      title: '快速配送',
      description: '支持同城面交，全国快递3天内送达'
    },
    {
      icon: MoneyIcon,
      title: '安全支付',
      description: '多重支付方式，交易安全有保障'
    },
    {
      icon: FavoriteIcon,
      title: '个性推荐',
      description: '基于AI智能算法，精准推荐您需要的图书'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Fade in={visible} timeout={1000}>
        <Paper 
          elevation={0}
          sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 10 }, 
            mb: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              📚 让知识再次发光
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              在这里，闲置的图书找到新的主人，知识的价值得以延续
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/books')}
                sx={{ 
                  px: 5, 
                  py: 2,
                  fontSize: '1.1rem',
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                开始探索
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/post')}
                sx={{ 
                  px: 5, 
                  py: 2,
                  fontSize: '1.1rem',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                发布图书
              </Button>
            </Stack>
          </Box>
          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)'
            }}
          />
        </Paper>
      </Fade>



      {/* Categories Section */}
      <Box sx={{ mb: 10 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
          📂 热门分类
        </Typography>
        {loading ? (
          <Grid container spacing={3}>
            {[1,2,3,4,5,6].map((item) => (
              <Grid item xs={6} sm={4} md={2} key={item}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {processedCategories.map((category, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Slide 
                  in={visible} 
                  direction="up" 
                  timeout={1200 + index * 100}
                  mountOnEnter 
                  unmountOnExit
                >
                  <Paper
                    elevation={2}
                    sx={{ 
                      cursor: 'pointer',
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      background: `linear-gradient(135deg, ${category.color}22 0%, ${category.color}44 100%)`,
                      borderLeft: `4px solid ${category.color}`,
                      '&:hover': { 
                        transform: 'translateY(-6px)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                        background: `linear-gradient(135deg, ${category.color}33 0%, ${category.color}66 100%)`
                      }
                    }}
                    onClick={() => navigate('/books')}
                  >
                    <Typography variant="h3" gutterBottom>
                      {category.icon}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {category.count} 本图书
                    </Typography>
                  </Paper>
                </Slide>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Featured Books */}
      <Box sx={{ mb: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            🔥 精选推荐
          </Typography>
          <Button
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/books')}
            sx={{ fontWeight: 'bold' }}
          >
            查看更多
          </Button>
        </Box>
        {loading ? (
          <Grid container spacing={4}>
            {[1,2,3,4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={400} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {featuredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={3} key={book.id}>
                <Card
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                    }
                  }}
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      sx={{
                        height: 250,
                        objectFit: 'cover',
                      }}
                      image={book.image}
                      alt={book.title}
                    />
                    {book.discount > 0 && (
                      <Chip
                        label={`省${book.discount}%`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: '#ff4757',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    <Chip
                      label={book.condition}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                    <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 'bold', mb: 1 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      {book.author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={book.rating || 4.5} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({book.reviews || 0} 评价)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          ¥{book.price}
                        </Typography>
                        {book.originalPrice && book.originalPrice > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ¥{book.originalPrice}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          minWidth: 'auto',
                          px: 2
                        }}
                      >
                        查看详情
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
          ✨ 为什么选择我们
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  border: '2px solid #f0f0f0',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}
                >
                  <feature.icon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Fade in={visible} timeout={2000}>
        <Paper
          elevation={0}
          sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 8 }, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              🚀 立即加入我们的社区
            </Typography>
            <Typography variant="body1" sx={{ mb: 6, maxWidth: 600, mx: 'auto', lineHeight: 1.7, opacity: 0.95 }}>
              在这里，您可以找到性价比高的二手图书，也可以将自己的闲置图书卖给需要的人。
              让我们一起为环保和知识传播贡献力量！
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                立即注册
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                sx={{ 
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  color: 'white',
                  borderColor: 'white',
                  fontWeight: 'bold',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                了解更多
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Fade>
    </Container>
  )
}

export default Home