const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: process.env.DB_CHARSET || 'utf8mb4'
};

async function createDatabaseAndTables() {
  let connection;
  
  try {
    // 首先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 成功连接到MySQL服务器');

    // 创建数据库
    console.log('🔨 创建数据库 secondhand_books...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS secondhand_books CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 数据库创建成功');

    // 切换到创建的数据库
    await connection.execute('USE secondhand_books');

    // 创建用户表
    console.log('🔨 创建用户表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        real_name VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3,2) DEFAULT 5.00,
        total_sales INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 用户表创建成功');

    // 创建图书分类表
    console.log('🔨 创建分类表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 分类表创建成功');

    // 创建图书表
    console.log('🔨 创建图书表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        publisher VARCHAR(255),
        isbn VARCHAR(20),
        category_id INT,
        seller_id INT NOT NULL,
        original_price DECIMAL(10,2),
        selling_price DECIMAL(10,2) NOT NULL,
        condition_level ENUM('全新', '九成新', '八成新', '七成新', '六成新及以下') NOT NULL,
        description TEXT,
        images JSON,
        location VARCHAR(255),
        delivery_methods JSON,
        status ENUM('待售', '已预订', '已售出', '已下架') DEFAULT '待售',
        view_count INT DEFAULT 0,
        favorite_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )
    `);
    console.log('✅ 图书表创建成功');

    // 创建购物车表
    console.log('🔨 创建购物车表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        quantity INT DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE KEY unique_user_book (user_id, book_id)
      )
    `);
    console.log('✅ 购物车表创建成功');

    // 创建订单表
    console.log('🔨 创建订单表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        book_id INT NOT NULL,
        quantity INT DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_method VARCHAR(50),
        delivery_address TEXT,
        status ENUM('待付款', '待发货', '待收货', '已完成', '已取消', '退款中', '已退款') DEFAULT '待付款',
        tracking_number VARCHAR(100),
        buyer_note TEXT,
        seller_note TEXT,
        paid_at TIMESTAMP NULL,
        shipped_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);
    console.log('✅ 订单表创建成功');

    // 创建收藏表
    console.log('🔨 创建收藏表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE KEY unique_user_book (user_id, book_id)
      )
    `);
    console.log('✅ 收藏表创建成功');

    // 创建评价表
    console.log('🔨 创建评价表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        book_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        reviewee_id INT NOT NULL,
        order_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        images JSON,
        is_anonymous BOOLEAN DEFAULT FALSE,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id),
        FOREIGN KEY (reviewer_id) REFERENCES users(id),
        FOREIGN KEY (reviewee_id) REFERENCES users(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);
    console.log('✅ 评价表创建成功');

    // 创建消息表
    console.log('🔨 创建消息表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        book_id INT NULL,
        order_id INT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);
    console.log('✅ 消息表创建成功');

    // 创建系统通知表
    console.log('🔨 创建通知表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('订单', '评价', '系统', '活动') DEFAULT '系统',
        related_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ 通知表创建成功');

    // 创建地址表
    console.log('🔨 创建地址表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        province VARCHAR(50) NOT NULL,
        city VARCHAR(50) NOT NULL,
        district VARCHAR(50) NOT NULL,
        address_detail VARCHAR(255) NOT NULL,
        postal_code VARCHAR(10),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ 地址表创建成功');

    // 创建支付记录表
    console.log('🔨 创建支付记录表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('微信支付', '支付宝', '银行卡') NOT NULL,
        transaction_id VARCHAR(100),
        status ENUM('待支付', '支付成功', '支付失败', '已退款') DEFAULT '待支付',
        paid_at TIMESTAMP NULL,
        refund_amount DECIMAL(10,2) DEFAULT 0,
        refund_reason TEXT,
        refunded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);
    console.log('✅ 支付记录表创建成功');

    // 插入默认分类数据
    console.log('🔨 插入默认分类数据...');
    await connection.execute(`
      INSERT IGNORE INTO categories (name, description) VALUES
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
      ('其他', '其他类别的二手书籍')
    `);
    console.log('✅ 分类数据插入成功');

    console.log('\n🎉 数据库和表结构创建完成！');
    console.log('现在可以运行模拟数据插入脚本了。');

  } catch (error) {
    console.error('❌ 创建数据库时出错:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 请检查：');
      console.log('1. MySQL服务是否已启动');
      console.log('2. MySQL连接配置是否正确（host、user、password）');
      console.log('3. 用户是否有足够的权限');
    }
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDatabaseAndTables();