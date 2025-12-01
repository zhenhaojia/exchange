import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material'
import { booksAPI } from '../services/api'

const EditBook = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    category_id: '',
    original_price: '',
    selling_price: '',
    condition_level: '全新',
    description: '',
    location: '',
    delivery_methods: [] as string[]
  })

  const [images, setImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  const conditions = [
    { value: '全新', label: '全新' },
    { value: '九成新', label: '九成新' },
    { value: '八成新', label: '八成新' },
    { value: '七成新', label: '七成新' },
    { value: '六成新', label: '六成新' }
  ]

  const deliveryOptions = [
    { value: '快递', label: '快递邮寄' },
    { value: '邮寄', label: '普通邮寄' },
    { value: '同城面交', label: '同城面交' }
  ]

  useEffect(() => {
    if (id) {
      fetchBookData()
      fetchCategories()
    }
  }, [id])

  const fetchBookData = async () => {
    try {
      const response = await booksAPI.getBook(Number(id))
      const book = response.data

      // 解析图片数据
      let parsedImages = []
      if (book.images) {
        try {
          parsedImages = typeof book.images === 'string' ? JSON.parse(book.images) : book.images
        } catch (e) {
          console.warn('图片数据解析失败:', book.images)
        }
      }

      // 解析配送方式
      let deliveryMethods = []
      if (book.delivery_methods) {
        try {
          deliveryMethods = typeof book.delivery_methods === 'string' 
            ? JSON.parse(book.delivery_methods) 
            : book.delivery_methods
        } catch (e) {
          console.warn('配送方式解析失败:', book.delivery_methods)
        }
      }

      setFormData({
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        isbn: book.isbn || '',
        category_id: book.category_id?.toString() || '',
        original_price: book.original_price?.toString() || '',
        selling_price: book.selling_price?.toString() || '',
        condition_level: book.condition_level || '全新',
        description: book.description || '',
        location: book.location || '',
        delivery_methods: deliveryMethods
      })

      setImages(parsedImages)
    } catch (error) {
      console.error('获取图书信息失败:', error)
      setError('获取图书信息失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await booksAPI.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleDeliveryMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      delivery_methods: prev.delivery_methods.includes(method)
        ? prev.delivery_methods.filter(m => m !== method)
        : [...prev.delivery_methods, method]
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setNewImages(prev => [...prev, ...files])
  }

  const handleRemoveExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const formDataToSend = new FormData()
      
      // 添加表单字段
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'delivery_methods') {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, value.toString())
        }
      })

      // 添加新上传的图片
      newImages.forEach(file => {
        formDataToSend.append('images', file)
      })

      // 如果删除了现有图片，需要告知后端保留的图片
      formDataToSend.append('existing_images', JSON.stringify(images))

      await booksAPI.updateBook(Number(id), formDataToSend)
      setSuccess('图书信息更新成功！')
      
      // 2秒后跳转回图书详情页
      setTimeout(() => {
        navigate(`/books/${id}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('更新图书失败:', error)
      setError(error.response?.data?.error || '更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>加载图书信息中...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/books/${id}`)}
            sx={{ mr: 2 }}
          >
            返回
          </Button>
          <Typography variant="h4" component="h1">
            编辑图书信息
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 基本信息 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="图书标题"
                value={formData.title}
                onChange={handleInputChange('title')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="作者"
                value={formData.author}
                onChange={handleInputChange('author')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="出版社"
                value={formData.publisher}
                onChange={handleInputChange('publisher')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={formData.isbn}
                onChange={handleInputChange('isbn')}
              />
            </Grid>

            {/* 分类和价格 */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>分类</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={handleInputChange('category_id')}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="原价 (¥)"
                type="number"
                value={formData.original_price}
                onChange={handleInputChange('original_price')}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="售价 (¥)"
                type="number"
                value={formData.selling_price}
                onChange={handleInputChange('selling_price')}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            {/* 新旧程度 */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>新旧程度</InputLabel>
                <Select
                  value={formData.condition_level}
                  onChange={handleInputChange('condition_level')}
                  required
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="所在地区"
                value={formData.location}
                onChange={handleInputChange('location')}
                required
              />
            </Grid>

            {/* 图书描述 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="图书描述"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange('description')}
                required
              />
            </Grid>

            {/* 配送方式 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                配送方式
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {deliveryOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    clickable
                    color={formData.delivery_methods.includes(option.value) ? 'primary' : 'default'}
                    onClick={() => handleDeliveryMethodChange(option.value)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>

            {/* 现有图片 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                现有图片
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={image}
                      alt={`图片 ${index + 1}`}
                      sx={{
                        width: 120,
                        height: 160,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #ddd'
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveExistingImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* 新上传图片 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                添加新图片
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  选择图片
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </Button>
                
                {newImages.map((file, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      alt={`新图片 ${index + 1}`}
                      sx={{
                        width: 120,
                        height: 160,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #ddd'
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveNewImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* 提交按钮 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                  sx={{ minWidth: 200 }}
                >
                  {saving ? '保存中...' : '保存修改'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}

export default EditBook