import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Table, 
  Tag,
  Timeline,
  Progress,
  Space,
  Button
} from 'antd'
import { 
  CrownOutlined, 
  TrophyOutlined,
  GiftOutlined,
  CalendarOutlined,
  HistoryOutlined,
  BookOutlined,
  SwapOutlined,
  ReadOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { CoinTransaction } from '../types'
import { COIN_CONFIG, USER_LEVELS } from '../constants'
import './CoinCenter.css'

const { Title, Paragraph } = Typography

const CoinCenter: React.FC = () => {
  const { user } = useAuthStore()
  const { coins, transactions, fetchCoins, fetchTransactions } = useCoinStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true)
        try {
          await fetchCoins(user.id)
          await fetchTransactions(user.id)
        } catch (error) {
          console.error('Failed to fetch coin data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user, fetchCoins, fetchTransactions])

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

  const getTransactionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      earn: '收入',
      spend: '支出'
    }
    return typeMap[type] || type
  }

  const getSourceLabel = (source: string) => {
    const sourceMap: Record<string, string> = {
      register: '注册奖励',
      daily_checkin: '每日签到',
      daily_read: '阅读推荐',
      exchange: '图书交换',
      read: '在线阅读',
      system: '系统赠送',
    }
    return sourceMap[source] || source
  }

  const getSourceIcon = (source: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      register: <GiftOutlined />,
      daily_checkin: <CalendarOutlined />,
      daily_read: <ReadOutlined />,
      exchange: <SwapOutlined />,
      read: <BookOutlined />,
      system: <TrophyOutlined />,
    }
    return iconMap[source] || <CrownOutlined />
  }

  const transactionColumns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'earn' ? 'green' : 'red'}>
          {getTransactionTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: '来源/用途',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => (
        <Space>
          {getSourceIcon(source)}
          <span>{getSourceLabel(source)}</span>
        </Space>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount: number, record: any) => (
        <span style={{ 
          color: record.type === 'earn' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {record.type === 'earn' ? '+' : '-'}{amount}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  const recentTransactions = transactions.slice(0, 10)
  const totalEarned = transactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = transactions
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0)

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className="coin-center">
      <div className="container">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <Title level={1}>
            <CrownOutlined /> 虚拟币中心
          </Title>
          <Paragraph>
            管理您的虚拟币资产，查看交易记录，了解获取方式
          </Paragraph>
        </motion.div>

        {/* 统计概览 */}
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="stat-card primary">
                <Statistic
                  title="当前余额"
                  value={coins}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="stat-card success">
                <Statistic
                  title="累计收入"
                  value={totalEarned}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="stat-card danger">
                <Statistic
                  title="累计支出"
                  value={totalSpent}
                  prefix={<SwapOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="stat-card info">
                <Statistic
                  title="交易次数"
                  value={transactions.length}
                  prefix={<HistoryOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* 左侧：获取方式 */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="earning-ways-card">
                <Title level={3}>
                  <GiftOutlined /> 获取虚拟币方式
                </Title>
                
                <Timeline className="earning-timeline">
                  <Timeline.Item color="green">
                    <div className="way-item">
                      <div className="way-header">
                        <GiftOutlined className="way-icon" />
                        <span className="way-title">注册奖励</span>
                        <Tag color="green">+{COIN_CONFIG.REGISTER_BONUS}</Tag>
                      </div>
                      <Paragraph>新用户注册即可获得虚拟币奖励</Paragraph>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item color="blue">
                    <div className="way-item">
                      <div className="way-header">
                        <CalendarOutlined className="way-icon" />
                        <span className="way-title">每日签到</span>
                        <Tag color="blue">+{COIN_CONFIG.DAILY_CHECKIN_BONUS}</Tag>
                      </div>
                      <Paragraph>每日签到可获得虚拟币，连续签到有额外奖励</Paragraph>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item color="purple">
                    <div className="way-item">
                      <div className="way-header">
                        <ReadOutlined className="way-icon" />
                        <span className="way-title">阅读推荐</span>
                        <Tag color="purple">+{COIN_CONFIG.DAILY_READ_BONUS}</Tag>
                      </div>
                      <Paragraph>阅读每日精选推荐的图书可获得奖励</Paragraph>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item>
                    <div className="way-item">
                      <div className="way-header">
                        <TrophyOutlined className="way-icon" />
                        <span className="way-title">系统奖励</span>
                        <Tag>不定时</Tag>
                      </div>
                      <Paragraph>参与平台活动可获得额外虚拟币奖励</Paragraph>
                    </div>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </motion.div>
          </Col>

          {/* 中间：等级进度 */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="level-card">
                <Title level={3}>
                  <TrophyOutlined /> 用户等级
                </Title>

                <div className="current-level">
                  <div className="level-badge">
                    <TrophyOutlined className="level-icon" />
                    <div className="level-info">
                      <span className="level-name">{getUserLevel().name}</span>
                      <span className="level-number">Lv.{getUserLevel().level}</span>
                    </div>
                  </div>
                  
                  <div className="exp-info">
                    <span>{user.exp} EXP</span>
                    {getNextLevel() && (
                      <span>/ {getNextLevel().exp} EXP</span>
                    )}
                  </div>
                </div>

                {getNextLevel() && (
                  <div className="level-progress">
                    <div className="progress-header">
                      <span>升级进度</span>
                      <span>{Math.round(getLevelProgress())}%</span>
                    </div>
                    <Progress
                      percent={getLevelProgress()}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      className="level-progress-bar"
                    />
                    <div className="progress-footer">
                      还需 {getNextLevel().exp - user.exp} EXP 升级到 {getNextLevel().name}
                    </div>
                  </div>
                )}

                <div className="level-benefits">
                  <Title level={4}>等级权益</Title>
                  <ul className="benefits-list">
                    <li>更高的虚拟币获取效率</li>
                    <li>专属图书推荐权限</li>
                    <li>平台活动优先参与权</li>
                    <li>个性化阅读建议服务</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* 右侧：消费方式 */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="spending-ways-card">
                <Title level={3}>
                  <SwapOutlined /> 虚拟币用途
                </Title>

                <div className="spending-items">
                  <div className="spending-item">
                    <div className="spending-header">
                      <SwapOutlined className="spending-icon" />
                      <div className="spending-info">
                        <span className="spending-title">图书交换</span>
                        <Tag color="red">-{COIN_CONFIG.EXCHANGE_BOOK_COST}</Tag>
                      </div>
                    </div>
                    <Paragraph>交换其他书友的优质图书</Paragraph>
                  </div>

                  <div className="spending-item">
                    <div className="spending-header">
                      <ReadOutlined className="spending-icon" />
                      <div className="spending-info">
                        <span className="spending-title">在线阅读</span>
                        <Tag color="orange">-{COIN_CONFIG.READ_BOOK_COST}</Tag>
                      </div>
                    </div>
                    <Paragraph>在线阅读精选图书内容</Paragraph>
                  </div>
                </div>

                <div className="quick-actions">
                  <Button type="primary" size="large" block href="/daily-checkin">
                    <CalendarOutlined /> 每日签到
                  </Button>
                  <Button size="large" block href="/books">
                    <BookOutlined /> 浏览图书
                  </Button>
                  <Button size="large" block href="/ai-recommend">
                    <TrophyOutlined /> AI推荐
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* 交易记录 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="transactions-section"
        >
          <Card>
            <Title level={3}>
              <HistoryOutlined /> 最近交易记录
            </Title>
            
            <Table
              columns={transactionColumns}
              dataSource={recentTransactions}
              rowKey="id"
              pagination={false}
              loading={loading}
              locale={{ emptyText: '暂无交易记录' }}
            />

            {transactions.length > 10 && (
              <div className="view-all">
                <Button type="link" href="/profile">
                  查看全部交易记录
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default CoinCenter