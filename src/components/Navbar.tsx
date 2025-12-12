import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeOutlined, 
  BookOutlined, 
  UserOutlined, 
  LoginOutlined,
  LogoutOutlined,
  CrownOutlined,
  RobotOutlined,
  CalendarOutlined,
  DollarOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { messageService } from '../services/messages'
import './Navbar.css'

const { Header } = Layout

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { coins, transactions } = useCoinStore()
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  useEffect(() => {
    // 获取未读消息数量
    if (user) {
      messageService.getUnreadCount().then(count => {
        setUnreadCount(count)
      }).catch(error => {
        console.error('获取未读消息数量失败:', error)
      })
    }
  }, [user])

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: 'coin-center',
      icon: <DollarOutlined />,
      label: <Link to="/coin-center">虚拟币中心</Link>,
    },
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: <Link to="/messages">消息中心</Link>,
    },
    {
      key: 'book-content-admin',
      icon: <BookOutlined />,
      label: <Link to="/admin/book-content">内容管理</Link>,
    },
    {
      key: 'divider2',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: <Link to="/books">图书广场</Link>,
    },
    {
      key: '/ai-recommend',
      icon: <RobotOutlined />,
      label: <Link to="/ai-recommend">AI推荐</Link>,
    },
    ...(user ? [
      {
        key: '/daily-checkin',
        icon: <CalendarOutlined />,
        label: <Link to="/daily-checkin">每日签到</Link>,
      }
    ] : []),
  ]

  const todayTransactions = transactions.filter(t => 
    new Date(t.created_at).toDateString() === new Date().toDateString()
  )

  const hasCheckedInToday = todayTransactions.some(t => t.source === 'daily_checkin')

  return (
    <Header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <BookOutlined className="brand-icon" />
          <span className="brand-text">Exchange Cloud</span>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="navbar-menu"
        />

        <div className="navbar-actions">
          {user ? (
            <Space size="large">
              <Badge count={coins} overflowCount={9999}>
                <CrownOutlined className="coin-icon" />
              </Badge>
              
              {hasCheckedInToday && (
                <Badge dot>
                  <CalendarOutlined className="calendar-icon" />
                </Badge>
              )}

              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space className="user-info">
                  <Avatar 
                    src={user.avatar} 
                    icon={<UserOutlined />}
                    size="small"
                  />
                  <span className="username">{user.username}</span>
                </Space>
              </Dropdown>
            </Space>
          ) : (
            <Space>
              <Button 
                type="text" 
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
              >
                登录
              </Button>
              <Button 
                type="primary"
                onClick={() => navigate('/register')}
              >
                注册
              </Button>
            </Space>
          )}
        </div>
      </div>
    </Header>
  )
}

export default Navbar