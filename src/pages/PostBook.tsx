import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  IconButton,
  Alert,
  Divider,
  TextareaAutosize
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material'

const steps = ['基本信息', '详细信息', '定价发布']

interface BookData {
  title: string
  author: string
  publisher: string
  isbn: string
  publishDate: string
  category: string
  condition: string
  price: number
  originalPrice: number
  description: string
  conditionDescription: string
  images: string[]
  tags: string[]
  quantity: number
}

const PostBook = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [bookData, setBookData] = useState<BookData>({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    publishDate: '',
    category: '',
    condition: '',
    price: 0,
    originalPrice: 0,
    description: '',
    conditionDescription: '',
    images: [],
    tags: [],
    quantity: 1
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    '计算机科学',
    '文学小说',
    '经管励志',
    '外语学习',
    '生活百科',
    '教材教辅',
    '历史哲学',
    '艺术设计',
    '医学健康',
    '其他'
  ]

  const conditions = ['全新', '九成新', '八成新', '七成新', '六成新以下']

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!bookData.title) newErrors.title = '请输入图书标题'
        if (!bookData.author) newErrors.author = '请输入作者'
        if (!bookData.category) newErrors.category = '请选择分类'
        if (!bookData.condition) newErrors.condition = '请选择成色'
        break
      case 1:
        if (!bookData.description) newErrors.description = '请输入图书描述'
        if (!bookData.conditionDescription) newErrors.conditionDescription = '请输入成色说明'
        if (bookData.images.length === 0) newErrors.images = '请上传至少一张图片'
        break
      case 2:
        if (bookData.price <= 0) newErrors.price = '请输入合理的售价'
        if (bookData.originalPrice <= 0) newErrors.originalPrice = '请输入合理的原价'
        if (bookData.price >= bookData.originalPrice) newErrors.price = '售价不能高于原价'
        break
      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      console.log('发布图书:', bookData)
      // 这里调用API发布图书
      alert('图书发布成功！')
      navigate('/profile')
    }
  }

  const handleInputChange = (field: keyof BookData, value: any) => {
    setBookData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setBookData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // 最多5张图
      }))
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }))
      }
    }
  }

  const handleDeleteImage = (index: number) => {
    setBookData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && bookData.tags.length < 10) {
      setBookData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleDeleteTag = (tagToDelete: string) => {
    setBookData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }))
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>基本信息</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="图书标题 *"
                value={bookData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="作者 *"
                value={bookData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                error={!!errors.author}
                helperText={errors.author}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="出版社"
                value={bookData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={bookData.isbn}
                onChange={(e) => handleInputChange('isbn', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="出版时间"
                type="date"
                value={bookData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="数量"
                type="number"
                value={bookData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 99 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>分类 *</InputLabel>
                <Select
                  value={bookData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  error={!!errors.category}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {errors.category && <Typography variant="caption" color="error">{errors.category}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>成色 *</InputLabel>
                <Select
                  value={bookData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  error={!!errors.condition}
                >
                  {conditions.map(cond => (
                    <MenuItem key={cond} value={cond}>{cond}</MenuItem>
                  ))}
                </Select>
                {errors.condition && <Typography variant="caption" color="error">{errors.condition}</Typography>}
              </FormControl>
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>详细信息</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>图书图片 *</Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    上传图片
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  最多上传5张图片，支持JPG、PNG格式
                </Typography>
              </Box>
              {errors.images && <Alert severity="error" sx={{ mb: 2 }}>{errors.images}</Alert>}
              <Grid container spacing={2}>
                {bookData.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        image={image}
                        alt={`预图 ${index + 1}`}
                        sx={{ height: 150, objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteImage(index)}
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
                {bookData.images.length < 5 && (
                  <Grid item xs={6} sm={4} md={3}>
                    <Card
                      sx={{
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <AddIcon sx={{ fontSize: 48, color: '#ccc' }} />
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>图书描述 *</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={bookData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="请详细描述图书内容、特点、适用人群等..."
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>成色说明 *</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={bookData.conditionDescription}
            onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
            placeholder="请说明图书的具体成色，如是否有笔记、折角、破损等..."
            error={!!errors.conditionDescription}
            helperText={errors.conditionDescription}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>标签</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              size="small"
              placeholder="输入标签"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              sx={{ mr: 1 }}
            />
            <Button size="small" onClick={handleAddTag} disabled={bookData.tags.length >= 10}>
              添加
            </Button>
          </Box>
          <Box>
            {bookData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            最多添加10个标签
          </Typography>
        </Grid>
      </Grid>
    )

  case 2:
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>定价发布</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>原价 (元) *</Typography>
          <TextField
            fullWidth
            type="number"
            value={bookData.originalPrice}
            onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
            error={!!errors.originalPrice}
            helperText={errors.originalPrice}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>售价 (元) *</Typography>
          <TextField
            fullWidth
            type="number"
            value={bookData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            error={!!errors.price}
            helperText={errors.price}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        {bookData.originalPrice > 0 && bookData.price > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              折扣率：{Math.round((1 - bookData.price / bookData.originalPrice) * 100)}%
              {bookData.price < bookData.originalPrice * 0.3 && '，价格偏低可能影响买家信任度'}
              {bookData.price > bookData.originalPrice * 0.9 && '，价格偏高可能影响销售速度'}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>发布预览</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                {bookData.images.length > 0 ? (
                  <Box
                    component="img"
                    src={bookData.images[0]}
                    alt="预图"
                    sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1
                    }}
                  >
                    <CameraIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {bookData.title || '图书标题'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  作者：{bookData.author || '未知作者'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label={bookData.category || '未分类'} size="small" sx={{ mr: 1 }} />
                  <Chip label={bookData.condition || '未指定'} size="small" />
                </Box>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  ¥{bookData.price || 0}
                  {bookData.originalPrice > 0 && (
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through', ml: 2 }}
                    >
                      ¥{bookData.originalPrice}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {bookData.description || '暂无描述'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    )

  default:
    return null
  }
}

return (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Box sx={{ mb: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        返回
      </Button>
      <Typography variant="h4" gutterBottom>
        发布二手图书
      </Typography>
      <Typography variant="body1" color="text.secondary">
        简单几步，即可将您的闲置图书出售给需要的人
      </Typography>
    </Box>

    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>

    <Paper sx={{ p: 3, mb: 3 }}>
      {renderStepContent(activeStep)}
    </Paper>

    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button
        disabled={activeStep === 0}
        onClick={handleBack}
      >
        上一步
      </Button>
      <Button
        variant="contained"
        onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
      >
        {activeStep === steps.length - 1 ? '发布图书' : '下一步'}
      </Button>
    </Box>
  </Container>
)
}

export default PostBook