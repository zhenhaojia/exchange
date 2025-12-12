export const APP_CONFIG = {
  name: 'Exchange Cloud',
  description: '公益二手书交流平台',
  version: '1.0.0',
}

export const COIN_CONFIG = {
  REGISTER_BONUS: 50, // 注册奖励
  DAILY_CHECKIN_BONUS: 10, // 每日签到奖励
  DAILY_READ_BONUS: 5, // 阅读每日推荐奖励
  EXCHANGE_BOOK_COST: 20, // 交换图书所需虚拟币
  READ_BOOK_COST: 5, // 阅读图书所需虚拟币
}

export const BOOK_CATEGORIES = [
  '文学小说',
  '历史传记',
  '科技教育',
  '经济管理',
  '生活艺术',
  '少儿读物',
  '外语学习',
  '考试教辅',
  '哲学宗教',
  '社会科学',
  '其他',
]

export const BOOK_CONDITIONS = [
  { value: 'new', label: '全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' },
  { value: 'poor', label: '较差' },
]

export const USER_LEVELS = [
  { level: 1, name: '书友', exp: 0 },
  { level: 2, name: '书虫', exp: 100 },
  { level: 3, name: '书迷', exp: 500 },
  { level: 4, name: '书痴', exp: 1500 },
  { level: 5, name: '书圣', exp: 3000 },
]

export const API_ENDPOINTS = {
  USERS: '/users',
  BOOKS: '/books',
  EXCHANGES: '/exchanges',
  TRANSACTIONS: '/coin-transactions',
  RECOMMENDATIONS: '/daily-recommendations',
  AI_CHAT: '/ai/chat',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  BOOKS: '/books',
  BOOK_DETAIL: '/books/:id',
  AI_RECOMMEND: '/ai-recommend',
  DAILY_CHECKIN: '/daily-checkin',
  COIN_CENTER: '/coin-center',
}

export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: '登录成功！',
  LOGOUT_SUCCESS: '退出成功！',
  REGISTER_SUCCESS: '注册成功！获得50虚拟币奖励！',
  CHECKIN_SUCCESS: '签到成功！获得10虚拟币！',
  CHECKIN_ALREADY: '今日已签到！',
  EXCHANGE_SUCCESS: '交换请求已发送！',
  READ_SUCCESS: '阅读成功！扣除5虚拟币！',
  INSUFFICIENT_COINS: '虚拟币不足！',
  NETWORK_ERROR: '网络错误，请稍后重试！',
}