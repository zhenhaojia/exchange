const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secondhand_books_secret_key';
const DB_FILE = './secondhand_books.db';

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

// 简化的数据库类
class SimpleDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_FILE, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

const db = new SimpleDB();

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

// 数据库初始化
async function initDatabase() {
  try {
    await db.init();
    console.log('✅ SQLite数据库连接成功');

    // 创建表结构
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        real_name TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        rating REAL DEFAULT 5.00,
        total_sales INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        publisher TEXT,
        isbn TEXT,
        category_id INTEGER,
        seller_id INTEGER NOT NULL,
        original_price REAL,
        selling_price REAL NOT NULL,
        condition_level TEXT NOT NULL CHECK (condition_level IN ('全新', '九成新', '八成新', '七成新', '六成新及以下')),
        description TEXT,
        images TEXT,
        location TEXT,
        delivery_methods TEXT,
        status TEXT DEFAULT '待售' CHECK (status IN ('待售', '已预订', '已售出', '已下架')),
        view_count INTEGER DEFAULT 0,
        favorite_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE(user_id, book_id)
      )
    `);

    // 插入默认分类数据
    await db.run(`
      INSERT OR IGNORE INTO categories (name, description) VALUES
      ('文学小说', '包括现代文学、古典文学、网络小说等'),
      ('教材教辅', '大学教材、考试辅导、技能培训等'),
      ('经济管理', '经济学、管理学、投资理财等'),
      ('计算机科技', '编程、人工智能、网络安全等技术类书籍'),
      ('生活休闲', '美食、旅游、摄影、手工等生活类书籍'),
      ('艺术设计', '设计理论、绘画、摄影、建筑等艺术类书籍'),
      ('历史传记', '历史著作、人物传记、回忆录等'),
      ('少儿读物', '儿童文学、科普读物、绘本等'),
      ('外语学习', '英语、日语、法语等外语学习资料'),
      ('考试考证', '公务员考试、职业资格考试等'),
      ('其他', '其他类别的二手书籍');
    `);

    await insertMockData();
    console.log('🎉 SQLite数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  }
}

// 插入模拟数据
async function insertMockData() {
  try {
    // 插入用户数据
    const users = [
      { username: '张三', email: 'zhangsan@example.com', password: '123456', phone: '13800138001' },
      { username: '李四', email: 'lisi@example.com', password: '123456', phone: '13800138002' },
      { username: '王五', email: 'wangwu@example.com', password: '123456', phone: '13800138003' },
      { username: '赵六', email: 'zhaoliu@example.com', password: '123456', phone: '13800138004' },
      { username: '钱七', email: 'qianqi@example.com', password: '123456', phone: '13800138005' }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.run(
        'INSERT OR IGNORE INTO users (username, email, password, phone, rating, total_sales) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, user.email, hashedPassword, user.phone, 4.5 + Math.random(), Math.floor(Math.random() * 50)]
      );
    }

    // 获取分类
    const categories = await db.all('SELECT id, name FROM categories');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // 插入图书数据
    const books = [
      {
        title: 'JavaScript高级程序设计',
        author: 'Nicholas C.Zakas',
        publisher: '人民邮电出版社',
        isbn: '9787115275790',
        category_id: categoryMap['计算机科技'],
        original_price: 129.00,
        selling_price: 65.00,
        condition_level: '九成新',
        description: '经典JavaScript权威指南，内容全面，适合前端开发者学习。书页整洁无划痕，无缺页。',
        location: '北京市朝阳区',
        delivery_methods: JSON.stringify(['快递', '同城面交']),
        images: JSON.stringify(['https://via.placeholder.com/300x400/4CAF50/ffffff?text=JavaScript高级程序设计'])
      },
      {
        title: '深入理解计算机系统',
        author: 'Randal E.Bryant',
        publisher: '机械工业出版社',
        isbn: '9787111321330',
        category_id: categoryMap['计算机科技'],
        original_price: 139.00,
        selling_price: 89.00,
        condition_level: '八成新',
        description: '计算机系统经典教材，深入浅出讲解计算机原理。书脊有轻微磨损，内页完好。',
        location: '上海市浦东新区',
        delivery_methods: JSON.stringify(['快递', '邮寄']),
        images: JSON.stringify(['https://via.placeholder.com/300x400/2196F3/ffffff?text=深入理解计算机系统'])
      },
      {
        title: '人间失格',
        author: '太宰治',
        publisher: '作家出版社',
        isbn: '9787506374763',
        category_id: categoryMap['文学小说'],
        original_price: 28.00,
        selling_price: 15.00,
        condition_level: '九成新',
        description: '日本文学经典，太宰治代表作。书页全新，有轻微折痕。',
        location: '广州市天河区',
        delivery_methods: JSON.stringify(['快递', '同城面交', '邮寄']),
        images: JSON.stringify(['https://via.placeholder.com/300x400/FF9800/ffffff?text=人间失格'])
      },
      {
        title: '活着',
        author: '余华',
        publisher: '作家出版社',
        isbn: '9787506365437',
        category_id: categoryMap['文学小说'],
        original_price: 35.00,
        selling_price: 18.00,
        condition_level: '全新',
        description: '余华经典作品，感人至深的人生故事。全新未拆封。',
        location: '深圳市南山区',
        delivery_methods: JSON.stringify(['快递', '同城面交']),
        images: JSON.stringify(['https://via.placeholder.com/300x400/9C27B0/ffffff?text=活着'])
      },
      {
        title: '经济学的思维方式',
        author: '托马斯·索维尔',
        publisher: '中信出版社',
        isbn: '9787508663368',
        category_id: categoryMap['经济管理'],
        original_price: 68.00,
        selling_price: 38.00,
        condition_level: '八成新',
        description: '经济学入门经典，用通俗易懂的方式解释经济学原理。书角有轻微磨损。',
        location: '杭州市西湖区',
        delivery_methods: JSON.stringify(['快递', '邮寄']),
        images: JSON.stringify(['https://via.placeholder.com/300x400/F44336/ffffff?text=经济学的思维方式'])
      }
    ];

    for (const book of books) {
      await db.run(`
        INSERT INTO books (
          title, author, publisher, isbn, category_id, seller_id,
          original_price, selling_price, condition_level, description,
          location, delivery_methods, images, view_count, favorite_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        book.title, book.author, book.publisher, book.isbn,
        book.category_id, 1, book.original_price, // 使用第一个用户作为卖家
        book.selling_price, book.condition_level, book.description,
        book.location, book.delivery_methods, book.images,
        Math.floor(Math.random() * 200), Math.floor(Math.random() * 50)
      ]);
    }

    console.log('✅ 模拟数据插入完成');

  } catch (error) {
    console.error('插入模拟数据失败:', error);
  }
}

// API路由
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    const existing = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, phone]
    );

    res.status(201).json({ message: '注册成功', userId: result.lastID });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

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

app.get('/api/books', async (req, res) => {
  try {
    const books = await db.all(`
      SELECT b.*, c.name as category_name, u.username as seller_name, u.rating as seller_rating
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.status = '待售'
      ORDER BY b.created_at DESC
    `);

    res.json({ books, pagination: { page: 1, limit: 20, total: books.length, totalPages: 1 } });
  } catch (error) {
    console.error('获取图书列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await db.get(`
      SELECT b.*, c.name as category_name, u.username as seller_name, 
             u.email as seller_email, u.phone as seller_phone, u.rating as seller_rating
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.id = ?
    `, [bookId]);

    if (!book) {
      return res.status(404).json({ error: '图书不存在' });
    }

    // 增加浏览次数
    await db.run('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [bookId]);

    res.json(book);
  } catch (error) {
    console.error('获取图书详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户发布的图书
app.get('/api/my/books', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await db.all(`
      SELECT b.*, c.name as category_name, u.username as seller_name, u.rating as seller_rating
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.seller_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json({ books, pagination: { page: 1, limit: 20, total: books.length, totalPages: 1 } });
  } catch (error) {
    console.error('获取我的图书错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新图书信息
app.put('/api/books/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    
    // 检查图书是否存在且属于当前用户
    const existingBook = await db.get('SELECT * FROM books WHERE id = ? AND seller_id = ?', [bookId, userId]);
    
    if (!existingBook) {
      return res.status(404).json({ error: '图书不存在或无权限修改' });
    }

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

    // 处理图片
    let finalImages = existingBook.images; // 保留原有图片
    
    // 如果前端明确传入了要保留的现有图片
    if (req.body.existing_images) {
      try {
        finalImages = JSON.parse(req.body.existing_images);
      } catch (e) {
        console.warn('现有图片解析失败:', req.body.existing_images);
        finalImages = '[]';
      }
    }
    
    // 添加新上传的图片
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      let existingImages = [];
      if (finalImages) {
        try {
          existingImages = JSON.parse(finalImages);
        } catch (e) {
          console.warn('图片数据解析失败:', finalImages);
        }
      }
      finalImages = JSON.stringify([...existingImages, ...newImages]);
    }

    // 更新图书信息
    await db.run(`
      UPDATE books SET 
        title = ?, author = ?, publisher = ?, isbn = ?, category_id = ?,
        original_price = ?, selling_price = ?, condition_level = ?, 
        description = ?, location = ?, delivery_methods = ?, images = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND seller_id = ?
    `, [
      title, author, publisher, isbn, category_id,
      original_price, selling_price, condition_level,
      description, location, delivery_methods, finalImages,
      bookId, userId
    ]);

    // 返回更新后的图书信息
    const updatedBook = await db.get(`
      SELECT b.*, c.name as category_name, u.username as seller_name, u.rating as seller_rating
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.id = ?
    `, [bookId]);

    res.json(updatedBook);
  } catch (error) {
    console.error('更新图书错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除图书
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    
    // 检查图书是否存在且属于当前用户
    const existingBook = await db.get('SELECT * FROM books WHERE id = ? AND seller_id = ?', [bookId, userId]);
    
    if (!existingBook) {
      return res.status(404).json({ error: '图书不存在或无权限删除' });
    }

    // 删除图书
    await db.run('DELETE FROM books WHERE id = ? AND seller_id = ?', [bookId, userId]);

    res.json({ message: '图书删除成功' });
  } catch (error) {
    console.error('删除图书错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 SQLite服务器运行在 http://localhost:${PORT}`);
    console.log('\n🎉 数据库已自动初始化，包含模拟数据！');
    console.log('\n📋 测试账号：');
    console.log('用户名: 张三, 密码: 123456');
    console.log('用户名: 李四, 密码: 123456');
    console.log('用户名: 王五, 密码: 123456');
    console.log('\n💡 提示：现在可以启动前端开发服务器：');
    console.log('   npm run dev');
  });
});