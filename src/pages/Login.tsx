import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import './Auth.css'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

const Login: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useState(new URLSearchParams(window.location.search))
  const returnUrl = searchParams.get('return')

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      message.success('登录成功！')
      
      // 如果有返回URL，跳转到原页面
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl))
      } else {
        navigate('/')
      }
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
        message.error('请先验证您的邮箱，然后重新登录。如需重新发送验证邮件，请联系管理员。')
      } else {
        message.error(error.message || '登录失败，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>欢迎回来</Title>
          <Text type="secondary">登录您的账户继续使用</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          className="auth-form"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-button"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <div className="auth-footer">
          <Text>
            还没有账户？{' '}
            <Link to="/register" className="auth-link">
              立即注册
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login