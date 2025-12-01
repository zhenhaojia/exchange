import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  IconButton,
  Checkbox,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  ShoppingCart as CartIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  LocalShipping as ShippingIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'

interface CartItem {
  id: number
  title: string
  author: string
  price: number
  originalPrice: number
  image: string
  seller: string
  location: string
  condition: string
  quantity: number
  stock: number
  selected: boolean
}

interface Address {
  id: number
  name: string
  phone: string
  address: string
  isDefault: boolean
}

const Cart = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: 'JavaScript高级程序设计',
      author: 'Nicholas C. Zakas',
      price: 35.0,
      originalPrice: 89.0,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=150&h=200&fit=crop',
      seller: '张同学',
      location: '北京',
      condition: '九成新',
      quantity: 1,
      stock: 2,
      selected: true
    },
    {
      id: 2,
      title: '深入理解计算机系统',
      author: 'Randal E. Bryant',
      price: 45.0,
      originalPrice: 99.0,
      image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=150&h=200&fit=crop',
      seller: '李教授',
      location: '上海',
      condition: '八成新',
      quantity: 2,
      stock: 3,
      selected: true
    },
    {
      id: 3,
      title: '算法导论',
      author: 'Thomas H. Cormen',
      price: 55.0,
      originalPrice: 128.0,
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=150&h=200&fit=crop',
      seller: '王程序员',
      location: '深圳',
      condition: '七成新',
      quantity: 1,
      stock: 1,
      selected: false
    }
  ])

  const [addresses] = useState<Address[]>([
    {
      id: 1,
      name: '张三',
      phone: '13812345678',
      address: '北京市海淀区中关村大街1号',
      isDefault: true
    },
    {
      id: 2,
      name: '李四',
      phone: '13987654321',
      address: '上海市浦东新区陆家嘴金融街100号',
      isDefault: false
    }
  ])

  const [selectedAddress, setSelectedAddress] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  const [orderNote, setOrderNote] = useState('')

  const steps = ['确认购物车', '选择地址', '支付方式', '确认订单']

  const calculateSubtotal = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateShipping = () => {
    const selectedItems = cartItems.filter(item => item.selected)
    if (selectedItems.length === 0) return 0
    return selectedItems.length > 2 ? 0 : 10 // 满3件包邮
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, Math.min(item.stock, item.quantity + delta))
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  const handleSelectItem = (id: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ))
  }

  const handleSelectAll = (checked: boolean) => {
    setCartItems(prev => prev.map(item => ({ ...item, selected: checked })))
  }

  const handleDeleteItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    } else {
      handleSubmitOrder()
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmitOrder = () => {
    const selectedItems = cartItems.filter(item => item.selected)
    if (selectedItems.length === 0) {
      alert('请选择要结算的商品')
      return
    }
    
    console.log('提交订单:', {
      items: selectedItems,
      address: addresses.find(addr => addr.id === selectedAddress),
      paymentMethod,
      total: calculateTotal()
    })
    
    alert('订单提交成功！')
    navigate('/profile')
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Checkbox
                checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <Typography variant="h6" sx={{ ml: 1 }}>
                购物车 ({cartItems.length} 件商品)
              </Typography>
            </Box>

            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  购物车是空的
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  快去挑选您喜欢的二手图书吧！
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/books')}
                >
                  去逛逛
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {cartItems.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={item.selected}
                              onChange={() => handleSelectItem(item.id)}
                            />
                          </Grid>
                          <Grid item>
                            <Box
                              component="img"
                              src={item.image}
                              alt={item.title}
                              sx={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 1 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="h6" gutterBottom noWrap>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {item.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              卖家：{item.seller} · {item.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              成色：{item.condition}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <TextField
                                size="small"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1
                                  setCartItems(prev => prev.map(cartItem => 
                                    cartItem.id === item.id 
                                      ? { ...cartItem, quantity: Math.max(1, Math.min(item.stock, value)) }
                                      : cartItem
                                  ))
                                }}
                                inputProps={{ min: 1, max: item.stock, style: { textAlign: 'center', width: 60 } }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              库存：{item.stock} 件
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="h6" color="primary.main" textAlign="right">
                              ¥{item.price}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through', display: 'block', textAlign: 'right' }}
                            >
                              ¥{item.originalPrice}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>收货地址</Typography>
            <RadioGroup
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
            >
              {addresses.map((address) => (
                <Paper key={address.id} sx={{ p: 2, mb: 2, border: selectedAddress === address.id ? '2px solid primary.main' : '1px solid #e0e0e0' }}>
                  <FormControlLabel
                    value={address.id}
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {address.name} {address.phone}
                          </Typography>
                          {address.isDefault && (
                            <Chip label="默认地址" size="small" color="primary" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {address.address}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              ))}
            </RadioGroup>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              fullWidth
            >
              + 添加新地址
            </Button>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>支付方式</Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Paper sx={{ p: 2, mb: 2, border: paymentMethod === 'alipay' ? '2px solid primary.main' : '1px solid #e0e0e0' }}>
                  <FormControlLabel
                    value="alipay"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <Typography variant="subtitle1">支付宝</Typography>
                        <Chip label="推荐" size="small" color="primary" sx={{ ml: 2 }} />
                      </Box>
                    }
                  />
                </Paper>
                <Paper sx={{ p: 2, mb: 2, border: paymentMethod === 'wechat' ? '2px solid primary.main' : '1px solid #e0e0e0' }}>
                  <FormControlLabel
                    value="wechat"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <Typography variant="subtitle1">微信支付</Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper sx={{ p: 2, mb: 2, border: paymentMethod === 'bank' ? '2px solid primary.main' : '1px solid #e0e0e0' }}>
                  <FormControlLabel
                    value="bank"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <BankIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">银行卡支付</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>订单备注</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="请输入订单备注信息（选填）"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </Box>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>确认订单信息</Typography>
            
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>收货地址</Typography>
              <Typography variant="body2">
                {addresses.find(addr => addr.id === selectedAddress)?.name} {addresses.find(addr => addr.id === selectedAddress)?.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {addresses.find(addr => addr.id === selectedAddress)?.address}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>商品清单</Typography>
              <List>
                {cartItems.filter(item => item.selected).map((item) => (
                  <ListItem key={item.id}>
                    <ListItemAvatar>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{ width: 50, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={`数量：${item.quantity} | 单价：¥${item.price}`}
                    />
                    <Typography variant="h6" color="primary.main">
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>支付方式</Typography>
              <Typography variant="body2">
                {paymentMethod === 'alipay' && '支付宝'}
                {paymentMethod === 'wechat' && '微信支付'}
                {paymentMethod === 'bank' && '银行卡支付'}
              </Typography>
            </Paper>

            {orderNote && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>订单备注</Typography>
                <Typography variant="body2">{orderNote}</Typography>
              </Paper>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        返回
      </Button>

      <Typography variant="h4" gutterBottom>
        购物车
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {renderStepContent(activeStep)}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>订单摘要</Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">商品小计</Typography>
                <Typography variant="body2">¥{calculateSubtotal().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">运费</Typography>
                <Typography variant="body2">
                  {calculateShipping() === 0 ? '免运费' : `¥${calculateShipping().toFixed(2)}`}
                </Typography>
              </Box>
              {calculateShipping() > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  满3件商品即可享受免运费
                </Alert>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">合计</Typography>
                <Typography variant="h6" color="primary.main">
                  ¥{calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleNext}
              disabled={cartItems.filter(item => item.selected).length === 0}
            >
              {activeStep === steps.length - 1 ? '提交订单' : '下一步'}
            </Button>
            
            {activeStep > 0 && (
              <Button
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleBack}
              >
                上一步
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Cart