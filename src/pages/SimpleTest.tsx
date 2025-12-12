import React from 'react'

const SimpleTest: React.FC = () => {
  return (
    <div style={{background: 'lime', padding: '50px', textAlign: 'center'}}>
      <h1>简单测试页面</h1>
      <p>如果你能看到这个页面，说明路由工作正常</p>
      <p>当前时间: {new Date().toLocaleString()}</p>
    </div>
  )
}

export default SimpleTest