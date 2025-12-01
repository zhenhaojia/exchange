import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

const Register = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Step 0
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    // Step 1
    verificationCode: '',
    // Step 2
    username: '',
    realName: '',
    gender: '',
    birthDate: '',
    location: ''
  })

  const steps = ['基本信息', '验证账户', '完善资料']

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!formData.email) {
          newErrors.email = '请输入邮箱地址'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '请输入有效的邮箱地址'
        }

        if (!formData.phone) {
          newErrors.phone = '请输入手机号码'
        } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
          newErrors.phone = '请输入有效的手机号码'
        }

        if (!formData.password) {
          newErrors.password = '请输入密码'
        } else if (formData.password.length < 8) {
          newErrors.password = '密码至少需要8位字符'
        } else if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(formData.password)) {
          newErrors.password = '密码必须包含字母和数字'
        }

        if (!formData.confirmPassword) {
          newErrors.confirmPassword = '请确认密码'
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = '两次输入的密码不一致'
        }

        if (!formData.agreeTerms) {
          newErrors.agreeTerms = '请同意用户协议和隐私政策'
        }
        break

      case 1:
        if (!formData.verificationCode) {
          newErrors.verificationCode = '请输入验证码'
        } else if (formData.verificationCode.length !== 6) {
          newErrors.verificationCode = '验证码格式不正确'
        }
        break

      case 2:
        if (!formData.username) {
          newErrors.username = '请输入用户名'
        } else if (formData.username.length < 2 || formData.username.length > 20) {
          newErrors.username = '用户名长度应在2-20个字符之间'
        }

        if (!formData.realName) {
          newErrors.realName = '请输入真实姓名'
        }

        if (!formData.location) {
          newErrors.location = '请选择所在地区'
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === 0) {
        sendVerificationCode()
      }
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const sendVerificationCode = async () => {
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000))
      setVerificationSent(true)
      console.log('验证码已发送到:', formData.phone)
    } catch (error) {
      console.error('发送验证码失败:', error)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return

    setLoading(true)
    
    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('注册数据:', formData)
      // 这里应该调用真实的注册API
      
      alert('注册成功！请登录')
      navigate('/login')
    } catch (error) {
      setErrors({ general: '注册失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              基本信息
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              请填写您的基本信息以创建账户
            </Typography>

            <TextField
              fullWidth
              label="邮箱地址"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="手机号码"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password || '密码至少8位，包含字母和数字'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="确认密码"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  我已阅读并同意{' '}
                  <Link to="/terms" style={{ color: 'primary.main' }}>
                    用户协议
                  </Link>{' '}
                  和{' '}
                  <Link to="/privacy" style={{ color: 'primary.main' }}>
                    隐私政策
                  </Link>
                </Typography>
              }
              sx={{ mb: 2 }}
            />
            {errors.agreeTerms && (
              <Typography variant="caption" color="error" sx={{ ml: 3 }}>
                {errors.agreeTerms}
              </Typography>
            )}
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              验证账户
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              我们已向 {formData.phone} 发送了验证码，请输入6位验证码
            </Typography>

            <TextField
              fullWidth
              label="验证码"
              value={formData.verificationCode}
              onChange={(e) => handleInputChange('verificationCode', e.target.value)}
              error={!!errors.verificationCode}
              helperText={errors.verificationCode}
              placeholder="请输入6位验证码"
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 2 }}
            />

            <Box textAlign="center">
              <Button
                variant="text"
                onClick={sendVerificationCode}
                disabled={verificationSent}
              >
                {verificationSent ? '验证码已发送' : '重新发送验证码'}
              </Button>
            </Box>

            {verificationSent && (
              <Alert severity="info" sx={{ mt: 2 }}>
                验证码已发送，请查收短信。如果没有收到，请检查手机号码是否正确。
              </Alert>
            )}
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              完善资料
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              完善您的个人信息，让其他用户更好地了解您
            </Typography>

            <TextField
              fullWidth
              label="用户名"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={!!errors.username}
              helperText={errors.username || '2-20个字符，可作为登录昵称'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="真实姓名"
              value={formData.realName}
              onChange={(e) => handleInputChange('realName', e.target.value)}
              error={!!errors.realName}
              helperText={errors.realName || '用于身份验证，不会公开显示'}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="所在地区"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              error={!!errors.location}
              helperText={errors.location || '例如：北京市海淀区'}
              placeholder="请输入您所在的地区"
              sx={{ mb: 2 }}
            />

            <Box textAlign="center" sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="success.main" gutterBottom>
                即将完成注册！
              </Typography>
              <Typography variant="body2" color="text.secondary">
                点击"完成注册"按钮，即可开始使用二手书交易市场
              </Typography>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          创建账户
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          加入我们的二手书交易社区
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            上一步
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? (loading ? '注册中...' : '完成注册') : '下一步'}
          </Button>
        </Box>

        <Box textAlign="center" sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            已有账户？{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" component="span">
                立即登录
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Register