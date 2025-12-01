const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secondhand_books_secret_key';

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'secondhand_books',
  charset: process.env.DB_CHARSET || 'utf8mb4'
};

// 创建数据库连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' });
    }
    req.user = user;
    next();
  });
};

// 数据库连接测试
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, phone]
    );

    res.status(201).json({ message: '注册成功', userId: result.insertId });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取图书列表
app.get('/api/books', async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT b.*, c.name as category_name, u.username as seller_name, u.rating as seller_rating
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.status = '待售'
    `;
    const params = [];

    // 添加搜索条件
    if (search) {
      query += ' AND (b.title LIKE ? OR b.author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND b.category_id = ?';
      params.push(category);
    }

    if (condition) {
      query += ' AND b.condition_level = ?';
      params.push(condition);
    }

    if (minPrice) {
      query += ' AND b.selling_price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND b.selling_price <= ?';
      params.push(maxPrice);
    }

    // 添加排序
    query += ` ORDER BY b.${sortBy} ${order}`;

    // 添加分页
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [books] = await pool.execute(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM books b WHERE b.status = "待售"';
    const countParams = [];

    if (search) {
      countQuery += ' AND (b.title LIKE ? OR b.author LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      countQuery += ' AND b.category_id = ?';
      countParams.push(category);
    }

    if (condition) {
      countQuery += ' AND b.condition_level = ?';
      countParams.push(condition);
    }

    if (minPrice) {
      countQuery += ' AND b.selling_price >= ?';
      countParams.push(minPrice);
    }

    if (maxPrice) {
      countQuery += ' AND b.selling_price <= ?';
      countParams.push(maxPrice);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取图书列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取图书详情
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;

    const [books] = await pool.execute(`
      SELECT b.*, c.name as category_name, u.username as seller_name, 
             u.email as seller_email, u.phone as seller_phone, u.rating as seller_rating
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.id = ?
    `, [bookId]);

    if (books.length === 0) {
      return res.status(404).json({ error: '图书不存在' });
    }

    const book = books[0];

    // 增加浏览次数
    await pool.execute('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [bookId]);

    res.json(book);
  } catch (error) {
    console.error('获取图书详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 发布图书
app.post('/api/books', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      author,
      publisher,
      isbn,
      category_id,
      original_price,
      selling_price,
      condition_level,
      description,
      location,
      delivery_methods
    } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const [result] = await pool.execute(`
      INSERT INTO books (
        title, author, publisher, isbn, category_id, seller_id,
        original_price, selling_price, condition_level, description,
        images, location, delivery_methods
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, author, publisher, isbn, category_id, req.user.userId,
      original_price, selling_price, condition_level, description,
      JSON.stringify(images), location, JSON.stringify(delivery_methods)
    ]);

    res.status(201).json({ message: '图书发布成功', bookId: result.insertId });
  } catch (error) {
    console.error('发布图书错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取分类列表
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加到购物车
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { book_id, quantity = 1 } = req.body;

    // 检查图书是否存在且可售
    const [books] = await pool.execute(
      'SELECT id, status, seller_id FROM books WHERE id = ?',
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: '图书不存在' });
    }

    const book = books[0];

    if (book.status !== '待售') {
      return res.status(400).json({ error: '图书不可售' });
    }

    if (book.seller_id === req.user.userId) {
      return res.status(400).json({ error: '不能购买自己发布的图书' });
    }

    // 添加到购物车
    await pool.execute(`
      INSERT INTO cart_items (user_id, book_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `, [req.user.userId, book_id, quantity]);

    res.json({ message: '添加到购物车成功' });
  } catch (error) {
    console.error('添加到购物车错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取购物车列表
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await pool.execute(`
      SELECT ci.*, b.title, b.author, b.selling_price, b.images, b.status,
             u.username as seller_name
      FROM cart_items ci
      LEFT JOIN books b ON ci.book_id = b.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE ci.user_id = ?
    `, [req.user.userId]);

    res.json(cartItems);
  } catch (error) {
    console.error('获取购物车错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建订单
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { book_id, quantity = 1, delivery_method, delivery_address, buyer_note } = req.body;

    // 检查图书信息
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ? AND status = "待售"',
      [book_id]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: '图书不存在或不可售' });
    }

    const book = books[0];

    if (book.seller_id === req.user.userId) {
      return res.status(400).json({ error: '不能购买自己发布的图书' });
    }

    // 生成订单号
    const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5);

    const totalAmount = book.selling_price * quantity;

    const [result] = await pool.execute(`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, book_id, quantity,
        price, total_amount, delivery_method, delivery_address, buyer_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber, req.user.userId, book.seller_id, book_id, quantity,
      book.selling_price, totalAmount, delivery_method, delivery_address, buyer_note
    ]);

    // 更新图书状态为已预订
    await pool.execute('UPDATE books SET status = "已预订" WHERE id = ?', [book_id]);

    // 从购物车移除
    await pool.execute('DELETE FROM cart_items WHERE user_id = ? AND book_id = ?', [req.user.userId, book_id]);

    res.status(201).json({
      message: '订单创建成功',
      orderNumber,
      orderId: result.insertId
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户信息
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, phone, avatar, real_name, is_verified, rating, total_sales, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动服务器
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
});