import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksAPI } from '../services/api'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Box,
  Tab,
  Tabs,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Rating,
  LinearProgress,
  Alert
} from '@mui/material'
import {
  Edit as EditIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  TrendingUp as TrendingIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Profile = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [myBooks, setMyBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    if (newValue === 0) {
      fetchMyBooks()
    }
  }

  useEffect(() => {
    fetchMyBooks()
  }, [])

  const fetchMyBooks = async () => {
    try {
      const response = await booksAPI.getMyBooks()
      
      // 处理图书数据
      const processedBooks = response.data.books.map((book: any) => {
        let imageUrl = `https://via.placeholder.com/300x400/4CAF50/ffffff?text=${encodeURIComponent(book.title)}`
        
        // 处理图片字段
        if (book.images) {
          try {
            const images = typeof book.images === 'string' ? JSON.parse(book.images) : book.images
            if (images && images.length > 0) {
              imageUrl = images[0]
            }
          } catch (e) {
            console.warn('图片数据解析失败:', book.images)
          }
        }
        
        return {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.selling_price,
          status: book.status,
          image: imageUrl,
          views: book.view_count || 0,
          likes: Math.floor(Math.random() * 50), // 模拟点赞数
          seller_id: book.seller_id
        }
      })
      
      setMyBooks(processedBooks)
    } catch (error) {
      console.error('获取图书数据失败:', error)
      
      // 设置模拟数据作为后备
      const fallbackBooks = [
        {
          id: 1,
          title: 'JavaScript高级程序设计',
          author: 'Nicholas C.Zakas',
          price: 89.00,
          image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=280&fit=crop',
          status: 'selling',
          views: 156,
          likes: 23
        },
        {
          id: 2,
          title: 'Python编程从入门到实践',
          author: 'Eric Matthes',
          price: 65.00,
          image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=200&h=280&fit=crop',
          status: 'selling',
          views: 89,
          likes: 15
        }
      ]
      
      setMyBooks(fallbackBooks)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('确定要删除这本书吗？此操作不可撤销。')) {
      return
    }

    try {
      await booksAPI.deleteBook(bookId)
      alert('删除成功')
      fetchMyBooks()
    } catch (error) {
      console.error('删除失败:', error)
      alert(error.response?.data?.error || '删除失败，请重试')
    }
  }

  // 模拟用户数据
  const user = {
    id: 1,
    username: '张同学',
    realName: '张三',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    email: 'zhangsan@example.com',
    phone: '138****5678',
    location: '北京市海淀区',
    joinDate: '2023-01-15',
    rating: 4.8,
    totalSales: 127,
    totalPurchases: 89,
    totalReviews: 156,
    verificationStatus: 'verified'
  }

  // 模拟统计数据
  const stats = {
    publishedBooks: 15,
    soldBooks: 127,
    purchasedBooks: 89,
    favoriteBooks: 23,
    totalRevenue: 8956.50,
    totalSpent: 3245.80,
    pendingOrders: 3,
    completedOrders: 216
  }

  // 模拟订单数据
  const orders = [
    {
      id: 'ORD202401150001',
      type: 'sale',
      bookTitle: 'JavaScript权威指南',
      bookImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=100&h=140&fit=crop',
      buyerName: '李同学',
      price: 45.0,
      status: 'pending',
      createDate: '2024-01-15'
    },
    {
      id: 'ORD202401140002',
      type: 'purchase',
      bookTitle: 'Python编程从入门到实践',
      bookImage: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=100&h=140&fit=crop',
      sellerName: '王程序员',
      price: 28.0,
      status: 'completed',
      createDate: '2024-01-14'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selling':
        return 'success'
      case 'sold':
        return 'default'
      case 'pending':
        return 'warning'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'selling':
        return '在售'
      case 'sold':
        return '已售'
      case 'pending':
        return '待处理'
      case 'completed':
        return '已完成'
      default:
        return '未知'
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 用户信息卡片 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3} textAlign="center">
            <Avatar
              src={user.avatar}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              fullWidth
            >
              编辑头像
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {user.username}
              {user.verificationStatus === 'verified' && (
                <Chip
                  label="已认证"
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={user.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {user.rating} ({user.totalReviews} 条评价)
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              📧 {user.email}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              📱 {user.phone}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              📍 {user.location}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              📅 加入时间：{user.joinDate}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6" color="primary.main" textAlign="center">
                  📈 {user.totalSales}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                  成功交易
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" color="success.main" textAlign="center">
                  ⭐ 好评率：98.5%
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                  用户评价
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* 数据统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" gutterBottom>
                📚 {stats.publishedBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                发布图书
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                ✅ {stats.soldBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                已售图书
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                🛒 {stats.purchasedBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                购买图书
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                ❤️ {stats.favoriteBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                收藏图书
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 标签页 */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="我的图书" />
            <Tab label="交易订单" />
            <Tab label="账户设置" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">我发布的图书</Typography>
                <Button
                  variant="contained"
                  startIcon={<OfferIcon />}
                  onClick={() => navigate('/post')}
                >
                  发布新书
                </Button>
              </Box>
              {loading ? (
                <Grid container spacing={2}>
                  {[1,2,3,4,5,6].map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item}>
                      <Card sx={{ height: 400 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : myBooks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    还没有发布任何图书
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<OfferIcon />}
                    onClick={() => navigate('/post')}
                    sx={{ mt: 2 }}
                  >
                    发布第一本书
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {myBooks.map((book) => (
                    <Grid item xs={12} sm={6} md={4} key={book.id}>
                      <Card>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={book.image}
                            alt={book.title}
                            sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                          <Chip
                            label={getStatusText(book.status)}
                            size="small"
                            color={getStatusColor(book.status)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        </Box>
                        <CardContent>
                          <Typography variant="h6" noWrap gutterBottom>
                            {book.title}
                          </Typography>
                          <Typography variant="h6" color="primary.main" gutterBottom>
                            ¥{book.price}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              👁 {book.views} 浏览
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ❤️ {book.likes} 收藏
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              startIcon={<ViewIcon />} 
                              fullWidth
                              onClick={() => navigate(`/books/${book.id}`)}
                            >
                              查看
                            </Button>
                            <Button 
                              size="small" 
                              startIcon={<EditIcon />} 
                              fullWidth
                              onClick={() => navigate(`/books/${book.id}/edit`)}
                              disabled={book.status === 'sold'}
                            >
                              编辑
                            </Button>
                            <Button 
                              size="small" 
                              startIcon={<DeleteIcon />} 
                              fullWidth
                              color="error"
                              onClick={() => handleDeleteBook(book.id)}
                              disabled={book.status === 'sold'}
                            >
                              删除
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>交易订单</Typography>
          <List>
            {orders.map((order, index) => (
              <React.Fragment key={order.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Box
                      component="img"
                      src={order.bookImage}
                      alt={order.bookTitle}
                      sx={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 1 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {order.bookTitle}
                        </Typography>
                        <Chip
                          label={getStatusText(order.status)}
                          size="small"
                          color={getStatusColor(order.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary">
                          {order.type === 'sale' ? `买家：${order.buyerName}` : `卖家：${order.sellerName}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          价格：¥{order.price} · 日期：{order.createDate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          订单号：{order.id}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" sx={{ mr: 1 }}>
                      <MessageIcon />
                    </IconButton>
                    <IconButton edge="end">
                      <ViewIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < orders.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>账户信息</Typography>
              <Paper sx={{ p: 2 }}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="用户名"
                      secondary={user.username}
                    />
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="邮箱"
                      secondary={user.email}
                    />
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="手机号"
                      secondary={user.phone}
                    />
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>交易设置</Typography>
              <Paper sx={{ p: 2 }}>
                <List>
                  <ListItem component="div" sx={{ cursor: 'pointer' }}>
                    <ListItemText
                      primary="收货地址管理"
                      secondary="管理您的收货地址"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem component="div" sx={{ cursor: 'pointer' }}>
                    <ListItemText
                      primary="支付方式"
                      secondary="管理绑定的支付方式"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem component="div" sx={{ cursor: 'pointer' }}>
                    <ListItemText
                      primary="消息通知设置"
                      secondary="自定义消息推送偏好"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 3, p: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={() => {
                    if (confirm('确定要退出登录吗？')) {
                      navigate('/login')
                    }
                  }}
                >
                  退出登录
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default Profile