import React from 'react'
import { Layout, Row, Col, Space, Divider } from 'antd'
import { 
  BookOutlined, 
  HeartOutlined, 
  MailOutlined,
  GithubOutlined,
  WechatOutlined
} from '@ant-design/icons'

const { Footer: AntFooter } = Layout

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Space>
                <BookOutlined className="footer-icon" />
                <h4>Exchange Cloud</h4>
              </Space>
              <p className="footer-description">
                公益二手书交流平台，让知识传递温暖，让阅读改变生活。
              </p>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4>平台功能</h4>
              <ul className="footer-links">
                <li>图书交换</li>
                <li>虚拟币系统</li>
                <li>AI智能推荐</li>
                <li>每日签到</li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4>帮助支持</h4>
              <ul className="footer-links">
                <li>使用指南</li>
                <li>常见问题</li>
                <li>联系客服</li>
                <li>意见反馈</li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h4>关注我们</h4>
              <Space size="large" className="footer-social">
                <GithubOutlined className="social-icon" />
                <WechatOutlined className="social-icon" />
                <MailOutlined className="social-icon" />
              </Space>
            </div>
          </Col>
        </Row>

        <Divider />

        <div className="footer-bottom">
          <p>
            © {currentYear} Exchange Cloud. Made with <HeartOutlined /> for readers.
          </p>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer