import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Button, 
  Tabs, 
  Table, 
  Tag,
  Space,
  Statistic,
  Modal,
  Form,
  Input,
  message,
  Upload
} from 'antd'
import { 
  UserOutlined, 
  EditOutlined, 
  BookOutlined, 
  SwapOutlined,
  HistoryOutlined,
  CrownOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { bookService } from '../services/books'
import { coinService } from '../services/coins'
import { Book, CoinTransaction, Exchange } from '../types'
import { USER_LEVELS } from '../constants'
import './Profile.css'

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const { coins, transactions, fetchCoins, fetchTransactions } = useCoinStore()
  const [userBooks, setUserBooks] = useState<Book[]>([])
  const [userExchanges, setUserExchanges] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true)
        try {
          // 获取用户虚拟币信息
          await fetchCoins(user.id)
          await fetchTransactions(user.id)

          // 获取用户发布的图书
          const books = await bookService.getUserBooks(user.id)
          setUserBooks(books)

          // 获取用户的交换记录
          // const exchanges = await exchangeService.getUserExchanges(user.id)
          // setUserExchanges(exchanges)
        } catch (error) {
          console.error('Failed to fetch user data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [user, fetchCoins, fetchTransactions])

  const handleEditProfile = () => {
    form.setFieldsValue({
      username: user?.username,
      bio: user?.bio,
    })
    setEditModalVisible(true)
  }

  const handleSaveProfile = async (values: any) => {
    if (!user) return
    
    try {
      // 这里需要实现更新用户资料的API调用
      message.success('个人资料更新成功！')
      setEditModalVisible(false)
    } catch (error: any) {
      message.error(error.message || '更新失败')
    }
  }

  const getUserLevel = () => {
    if (!user) return USER_LEVELS[0]
    return USER_LEVELS.find(level => level.level === user.level) || USER_LEVELS[0]
  }

  const getNextLevel = () => {
    const currentLevel = getUserLevel()
    const nextLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level) + 1
    return USER_LEVELS[nextLevelIndex] || null
  }

  const getLevelProgress = () => {
    if (!user) return 0
    const currentLevel = getUserLevel()
    const nextLevel = getNextLevel()
    if (!nextLevel) return 100
    return ((user.exp - currentLevel.exp) / (nextLevel.exp - currentLevel.exp)) * 100
  }

  const transactionColumns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'earn' ? 'green' : 'red'}>
          {type === 'earn' ? '收入' : '支出'}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span style={{ 
          color: record.type === 'earn' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {record.type === 'earn' ? '+' : '-'}{amount}
        </span>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        const sourceMap: Record<string, string> = {
          register: '注册奖励',
          daily_checkin: '每日签到',
          daily_read: '阅读推荐',
          exchange: '图书交换',
          read: '在线阅读',
          system: '系统赠送',
        }
        return sourceMap[source] || source
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  const bookColumns = [
    {
      title: '图书信息',
      key: 'book',
      render: (record: Book) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.title}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.author} · {record.category}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          available: { text: '可交换', color: 'green' },
          exchanged: { text: '已交换', color: 'red' },
          reserved: { text: '已预留', color: 'orange' },
        }
        const statusInfo = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: '交换次数',
      dataIndex: 'exchange_count',
      key: 'exchange_count',
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ]

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className="profile">
      <div className="container">
        <Row gutter={[24, 24]}>
          {/* 用户信息卡片 */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="user-card">
                <div className="user-header">
                  <Avatar
                    size={80}
                    src={user.avatar}
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <Title level={3} className="username">{user.username}</Title>
                    <Paragraph className="user-email">{user.email}</Paragraph>
                    <div className="user-level">
                      <Tag color="blue">{getUserLevel().name}</Tag>
                      <span className="level-exp">
                        {user.exp} EXP
                      </span>
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <Paragraph className="user-bio">{user.bio}</Paragraph>
                )}

                <div className="user-stats">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="虚拟币"
                        value={coins}
                        prefix={<CrownOutlined />}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="发布图书"
                        value={userBooks.length}
                        prefix={<BookOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                  </Row>
                </div>

                {/* 等级进度条 */}
                <div className="level-progress">
                  <div className="progress-info">
                    <span>Lv.{getUserLevel().level}</span>
                    {getNextLevel() && (
                      <span>Lv.{getNextLevel().level}</span>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getLevelProgress()}%` }}
                    />
                  </div>
                  {getNextLevel() && (
                    <div className="progress-text">
                      还需 {getNextLevel().exp - user.exp} EXP 升级
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  block
                  onClick={handleEditProfile}
                  style={{ marginTop: 16 }}
                >
                  编辑资料
                </Button>
              </Card>
            </motion.div>
          </Col>

          {/* 详细信息标签页 */}
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="detail-card">
                <Tabs defaultActiveKey="transactions">
                  <TabPane 
                    tab={
                      <span>
                        <CrownOutlined />
                        虚拟币记录
                      </span>
                    } 
                    key="transactions"
                  >
                    <Table
                      columns={transactionColumns}
                      dataSource={transactions}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      loading={loading}
                    />
                  </TabPane>

                  <TabPane 
                    tab={
                      <span>
                        <BookOutlined />
                        我的图书
                      </span>
                    } 
                    key="books"
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Button type="primary">
                        <Link to="/books/add">发布新图书</Link>
                      </Button>
                    </div>
                    <Table
                      columns={bookColumns}
                      dataSource={userBooks}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      loading={loading}
                    />
                  </TabPane>

                  <TabPane 
                    tab={
                      <span>
                        <SwapOutlined />
                        交换记录
                      </span>
                    } 
                    key="exchanges"
                  >
                    <Table
                      dataSource={userExchanges}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      loading={loading}
                      locale={{ emptyText: '暂无交换记录' }}
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* 编辑资料模态框 */}
      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
              { max: 20, message: '用户名不超过20个字符' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
            rules={[{ max: 200, message: '个人简介不超过200字' }]}
          >
            <Input.TextArea rows={4} placeholder="介绍一下自己..." />
          </Form.Item>

          <Form.Item name="avatar" label="头像">
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              // beforeUpload={beforeUpload}
              // onChange={handleChange}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile