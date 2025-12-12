import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import BookList from './pages/BookList'
import BookDetail from './pages/BookDetail'
import AIRecommend from './pages/AIRecommend'
import DailyCheckIn from './pages/DailyCheckIn'
import CoinCenter from './pages/CoinCenter'
import HomeDebug from './pages/HomeDebug'
import SimpleTest from './pages/SimpleTest'
import HomeSimple from './pages/HomeSimple'
import HomeClean from './pages/HomeClean'
import HomeFixed from './pages/HomeFixed'
import TestCheckIn from './pages/TestCheckIn'
import ReadBook from './pages/ReadBook'
import BookContentAdmin from './pages/BookContentAdmin'
import MessageCenter from './pages/MessageCenter'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './stores/authStore'

const { Content } = Layout

function App() {
  const { user } = useAuthStore()
  const [appChecked, setAppChecked] = useState(false)

  // 应用启动初始化
  useEffect(() => {
    if (!appChecked) {
      setAppChecked(true)
      console.log('应用启动完成')
    }
  }, [appChecked])

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test-home" element={<HomeSimple />} />
          <Route path="/test-clean" element={<HomeClean />} />
          <Route path="/test-fixed" element={<HomeFixed />} />
          <Route path="/test-checkin" element={<TestCheckIn />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-recommend" 
            element={
              <ProtectedRoute>
                <AIRecommend />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/daily-checkin" 
            element={
              <ProtectedRoute>
                <DailyCheckIn />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coin-center" 
            element={
              <ProtectedRoute>
                <CoinCenter />
              </ProtectedRoute>
            } 
          />
          <Route path="/debug" element={<HomeDebug />} />
          <Route path="/test" element={<SimpleTest />} />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessageCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages/:userId" 
            element={
              <ProtectedRoute>
                <MessageCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/read/:id" 
            element={
              <ProtectedRoute>
                <ReadBook />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/book-content" 
            element={
              <ProtectedRoute>
                <BookContentAdmin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  )
}

export default App