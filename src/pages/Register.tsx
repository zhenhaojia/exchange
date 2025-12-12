import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Divider, Space, Alert } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined, MailOutlined, WarningOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import './Auth.css'

const { Title, Text } = Typography

interface RegisterForm {
  email: string
  username: string
  password: string
  confirmPassword: string
}

const Register: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const onFinish = async (values: RegisterForm) => {
    setLoading(true)
    try {
      await signUp(values.email, values.password, values.username)
      message.success('注册成功！您的账户已激活，可以直接登录。')
      navigate('/login')
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>创建账户</Title>
          <Text type="secondary">
            注册即可获得50虚拟币奖励，开启您的阅读之旅
          </Text>
        </div>

        <Alert
          message="系统维护中"
          description="由于注册服务暂时不可用，系统将自动启用紧急注册模式。注册成功后请直接登录。"
          type="warning"
          icon={<WarningOutlined />}
          style={{ marginBottom: '24px' }}
          showIcon
        />

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
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
              { max: 20, message: '用户名不超过20个字符' },
              { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含中英文、数字和下划线' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
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

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码输入不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <div className="auth-footer">
          <Text>
            已有账户？{' '}
            <Link to="/login" className="auth-link">
              立即登录
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Register