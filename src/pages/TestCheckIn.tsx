import React, { useState } from 'react'
import { Card, Button, Typography, Space, Statistic, message, Divider } from 'antd'
import { CrownOutlined, CalendarOutlined, GiftOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'

const { Title, Paragraph } = Typography

const TestCheckIn: React.FC = () => {
  const { user } = useAuthStore()
  const { coins, fetchCoins, fetchTransactions, dailyCheckIn } = useCoinStore()
  const [loading, setLoading] = useState(false)
  const [lastCheckInResult, setLastCheckInResult] = useState<string>('')

  const handleTestCheckIn = async () => {
    if (!user) {
      message.error('请先登录')
      return
    }

    setLoading(true)
    try {
      const result = await dailyCheckIn(user.id)
      if (result) {
        message.success('签到成功！获得10虚拟币')
        setLastCheckInResult('签到成功 ✅')
      } else {
        message.info('今日已签到')
        setLastCheckInResult('今日已签到 ⏰')
      }
      
      // 刷新数据
      await fetchCoins(user.id)
      await fetchTransactions(user.id)
    } catch (error: any) {
      message.error(error.message || '签到失败')
      setLastCheckInResult(`签到失败 ❌: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    if (user) {
      await fetchCoins(user.id)
      await fetchTransactions(user.id)
      message.success('数据已刷新')
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="签到功能测试" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Statistic
            title="当前用户"
            value={user?.username || '未登录'}
            prefix={<CalendarOutlined />}
          />
          
          <Statistic
            title="当前虚拟币"
            value={coins}
            prefix={<CrownOutlined />}
            valueStyle={{ color: '#faad14' }}
          />

          {lastCheckInResult && (
            <div style={{
              padding: '16px',
              background: '#f0f2f5',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <strong>上次签到结果：</strong> {lastCheckInResult}
            </div>
          )}

          <Space>
            <Button
              type="primary"
              size="large"
              icon={<GiftOutlined />}
              loading={loading}
              onClick={handleTestCheckIn}
            >
              测试每日签到
            </Button>
            
            <Button
              size="large"
              onClick={refreshData}
            >
              刷新数据
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="功能说明">
        <ul>
          <li>每日签到可获得 <strong>10虚拟币</strong> 奖励</li>
          <li>每日只能签到一次</li>
          <li>签到同时获得 <strong>5经验值</strong></li>
          <li>新用户注册自动获得 <strong>50虚拟币</strong></li>
          <li>轮播图图书可以 <strong>免费阅读</strong> 并获得5虚拟币奖励</li>
        </ul>
        
        <Divider />
        
        <Paragraph>
          如果签到功能正常工作，你应该能够：
        </Paragraph>
        
        <ol>
          <li>看到当前用户名和虚拟币余额</li>
          <li>点击"测试每日签到"按钮</li>
          <li>成功签到后看到余额增加10虚拟币</li>
          <li>再次点击时显示"今日已签到"</li>
        </ol>
      </Card>
    </div>
  )
}

export default TestCheckIn