import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore()

  // 简单的认证检查，不再自动调用checkAuth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    // 保存当前URL以便登录后返回
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
    return <Navigate to={`/login?return=${returnUrl}`} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute