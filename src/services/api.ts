import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户认证相关
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post('/register', userData),

  login: (credentials: {
    username: string;
    password: string;
  }) => api.post('/login', credentials),

  getProfile: () => api.get('/user/profile'),
};

// 图书相关
export const booksAPI = {
  getBooks: (params: {
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) => api.get('/books', { params }),

  getBook: (id: number) => api.get(`/books/${id}`),

  postBook: (formData: FormData) => {
    return api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getCategories: () => api.get('/categories'),

  getMyBooks: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/my/books', { params }),

  updateBook: (id: number, formData: FormData) => {
    return api.put(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteBook: (id: number) => api.delete(`/books/${id}`),
};

// 购物车相关
export const cartAPI = {
  addToCart: (data: {
    book_id: number;
    quantity?: number;
  }) => api.post('/cart', data),

  getCart: () => api.get('/cart'),

  removeFromCart: (bookId: number) => api.delete(`/cart/${bookId}`),

  updateQuantity: (bookId: number, quantity: number) =>
    api.put(`/cart/${bookId}`, { quantity }),
};

// 订单相关
export const ordersAPI = {
  createOrder: (data: {
    book_id: number;
    quantity?: number;
    delivery_method: string;
    delivery_address: string;
    buyer_note?: string;
  }) => api.post('/orders', data),

  getOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/orders', { params }),

  getOrder: (id: number) => api.get(`/orders/${id}`),

  updateOrderStatus: (id: number, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
};

// 收藏相关
export const favoritesAPI = {
  addToFavorites: (bookId: number) => api.post('/favorites', { book_id: bookId }),

  removeFromFavorites: (bookId: number) => api.delete(`/favorites/${bookId}`),

  getFavorites: () => api.get('/favorites'),

  isFavorite: (bookId: number) => api.get(`/favorites/check/${bookId}`),
};

// 评价相关
export const reviewsAPI = {
  getReviews: (bookId: number, params?: {
    page?: number;
    limit?: number;
  }) => api.get(`/reviews/book/${bookId}`, { params }),

  createReview: (data: {
    book_id: number;
    order_id: number;
    rating: number;
    content?: string;
    images?: string[];
    is_anonymous?: boolean;
  }) => api.post('/reviews', data),

  getMyReviews: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/reviews/my', { params }),
};

// 消息相关
export const messagesAPI = {
  getMessages: (userId?: number, params?: {
    page?: number;
    limit?: number;
  }) => api.get(userId ? `/messages/${userId}` : '/messages', { params }),

  sendMessage: (data: {
    receiver_id: number;
    content: string;
    book_id?: number;
    order_id?: number;
  }) => api.post('/messages', data),

  markAsRead: (messageIds: number[]) => api.put('/messages/read', { message_ids: messageIds }),

  getUnreadCount: () => api.get('/messages/unread-count'),
};

export default api;