import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Avatar,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  Stack
} from '@mui/material'
import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  LocalOffer as OfferIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Message as MessageIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const BookDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  // 模拟图书数据
  const [book, setBook] = useState<any>(null)

  useEffect(() => {
    const mockBook = {
      id: parseInt(id || '1'),
      title: 'JavaScript高级程序设计',
      author: 'Nicholas C. Zakas',
      publisher: '人民邮电出版社',
      isbn: '978-7-115-27579-0',
      publishDate: '2012-03-01',
      pages: 748,
      language: '中文',
      price: 35.0,
      originalPrice: 89.0,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=crop',
      rating: 4.8,
      reviews: 156,
      condition: '九成新',
      category: '计算机科学',
      seller: {
        id: 1,
        name: '张同学',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 4.9,
        totalSales: 127,
        joinDate: '2023-01-15',
        location: '北京市海淀区',
        phone: '138****5678',
        email: 'zhang***@example.com'
      },
      description: '这本书是JavaScript领域的经典著作，涵盖了JavaScript语言的各个方面，从基础语法到高级特性，从DOM操作到AJAX应用，是前端开发者必读书籍。',
      conditionDescription: '书籍整体保存良好，有少量笔记，不影响阅读，无缺页破损。',
      images: [
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=crop'
      ],
      tags: ['JavaScript', '前端开发', '编程', 'Web开发'],
      stock: 2
    }
    setBook(mockBook)
  }, [id])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddToCart = () => {
    console.log(`添加 ${quantity} 本《${book?.title}》到购物车`)
    setShowAlert(true)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    console.log(isFavorite ? '取消收藏' : '添加收藏')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title,
        text: `发现一本好书《${book?.title}》，售价 ¥${book?.price}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (!book) {
    return <Typography>加载中...</Typography>
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 返回按钮 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        返回
      </Button>

      <Grid container spacing={4}>
        {/* 左侧：图书图片和基本信息 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={book.image}
              alt={book.title}
              sx={{ height: 500, objectFit: 'contain' }}
            />
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} justifyContent="center">
                {book.images.map((img: string, index: number) => (
                  <Box
                    key={index}
                    component="img"
                    src={img}
                    alt={`预图 ${index + 1}`}
                    sx={{
                      width: 60,
                      height: 80,
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.7 }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* 右侧：图书详情和操作 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              作者：{book.author}
            </Typography>
            
            {/* 评分和评价数 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={book.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {book.rating} ({book.reviews} 条评价)
              </Typography>
            </Box>

            {/* 标签 */}
            <Box sx={{ mb: 2 }}>
              {book.tags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  variant="outlined"
                />
              ))}
            </Box>

            {/* 价格信息 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold" gutterBottom>
                ¥{book.price}
                <Typography
                  component="span"
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through', ml: 2 }}
                >
                  ¥{book.originalPrice}
                </Typography>
                <Chip
                  icon={<OfferIcon />}
                  label={`${Math.round((1 - book.price / book.originalPrice) * 100)}% OFF`}
                  size="small"
                  color="secondary"
                  sx={{ ml: 2 }}
                />
              </Typography>
            </Box>

            {/* 图书信息 */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>图书信息</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">出版社</Typography>
                  <Typography variant="body2">{book.publisher}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">ISBN</Typography>
                  <Typography variant="body2">{book.isbn}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">出版时间</Typography>
                  <Typography variant="body2">{book.publishDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">页数</Typography>
                  <Typography variant="body2">{book.pages} 页</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">成色</Typography>
                  <Typography variant="body2">{book.condition}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">库存</Typography>
                  <Typography variant="body2" color={book.stock > 0 ? 'success.main' : 'error.main'}>
                    {book.stock > 0 ? `${book.stock} 本` : '已售罄'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* 操作按钮 */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                sx={{ flex: 1 }}
              >
                加入购物车
              </Button>
              <IconButton
                color={isFavorite ? "error" : "default"}
                onClick={handleToggleFavorite}
              >
                <FavoriteIcon />
              </IconButton>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Stack>

            {/* 卖家信息 */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>卖家信息</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={book.seller.avatar} sx={{ mr: 2, width: 48, height: 48 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{book.seller.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={book.seller.rating} size="small" readOnly />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {book.seller.rating} · 已售 {book.seller.totalSales} 本
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                <LocationIcon sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">{book.seller.location}</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<MessageIcon />}
                  variant="outlined"
                  sx={{ flex: 1 }}
                >
                  联系卖家
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* 详细信息标签页 */}
      <Box sx={{ mt: 4 }}>
        <Paper>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="book details tabs"
          >
            <Tab label="商品描述" />
            <Tab label="成色说明" />
            <Tab label="用户评价" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>
            <Typography variant="h6" gutterBottom>目录</Typography>
            <Typography variant="body2" color="text.secondary">
              第1章 JavaScript简介<br/>
              第2章 在HTML中使用JavaScript<br/>
              第3章 基本概念<br/>
              第4章 变量、作用域和内存问题<br/>
              第5章 引用类型<br/>
              第6章 面向对象的程序设计<br/>
              第7章 函数表达式<br/>
              第8章 BOM<br/>
              第9章 客户端检测<br/>
              第10章 DOM<br/>
              第11章 DOM扩展<br/>
              第12章 DOM2和DOM3<br/>
              第13章 事件<br/>
              第14章 表单脚本<br/>
              第15章 使用Canvas绘图<br/>
              第16章 HTML5脚本编程<br/>
              第17章 错误处理与调试<br/>
              第18章 JSON与Ajax<br/>
              第19章 E4X<br/>
              第20章 最佳实践<br/>
              第21章 新兴API<br/>
              第22章 高级技巧<br/>
              第23章 离线应用与客户端存储<br/>
              第24章 最佳实践<br/>
              第25章 新兴API<br/>
              第26章 未来展望
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1" paragraph>
              {book.conditionDescription}
            </Typography>
            <Typography variant="h6" gutterBottom>成色标准</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • 全新：全新未使用，无任何痕迹<br/>
              • 九成新：轻微使用痕迹，无明显污渍或破损<br/>
              • 八成新：正常使用痕迹，可能有少量笔记<br/>
              • 七成新：明显使用痕迹，有笔记或折角<br/>
              • 六成新以下：重度使用，有明显磨损
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>用户评价</Typography>
            <List>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>李</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1">李同学</Typography>
                      <Rating value={5} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        2024-01-15
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        书籍保存得很好，几乎和新的一样，卖家发货也很快，推荐！
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>王</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1">王工程师</Typography>
                      <Rating value={4} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        2024-01-08
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        内容很经典，纸张质量不错，就是有几页有笔记，但不影响阅读。
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
          </TabPanel>
        </Paper>
      </Box>

      {/* 提示消息 */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowAlert(false)} severity="success" sx={{ width: '100%' }}>
          已添加到购物车！
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default BookDetail