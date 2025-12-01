const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('🚀 简化MySQL数据库初始化...\n');

async function initMySQL() {
  let connection;
  
  try {
    // 连接MySQL服务器
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });
    
    console.log('✅ MySQL服务器连接成功');

    // 创建数据库
    await connection.execute('CREATE DATABASE IF NOT EXISTS secondhand_books CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 数据库创建成功');

    // 切换到目标数据库
    await connection.changeUser({ database: 'secondhand_books' });
    console.log('✅ 已切换到secondhand_books数据库');

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        real_name VARCHAR(50),
        is_verified BOOLEAN DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 5.00,
        total_sales INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 用户表创建成功');

    // 创建分类表
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
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        publisher VARCHAR(100),
        isbn VARCHAR(20),
        category_id INT,
        seller_id INT NOT NULL,
        original_price DECIMAL(10,2),
        selling_price DECIMAL(10,2) NOT NULL,
        condition_level INT DEFAULT 5,
        description TEXT,
        images TEXT,
        location VARCHAR(255),
        delivery_methods TEXT,
        status VARCHAR(20) DEFAULT '待售',
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )
    `);
    console.log('✅ 图书表创建成功');

    // 创建购物车表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);
    console.log('✅ 购物车表创建成功');

    // 创建订单表
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
        status VARCHAR(20) DEFAULT '待付款',
        delivery_method VARCHAR(50),
        delivery_address TEXT,
        buyer_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);
    console.log('✅ 订单表创建成功');

    // 插入分类数据
    const categories = [
      ['文学小说', '各类文学作品和小说'],
      ['教材教辅', '大中小学教材及教辅资料'],
      ['考试考证', '各类考试、资格认证用书'],
      ['计算机技术', '编程、软件开发等技术书籍'],
      ['经管理财', '经济学、管理学、理财投资'],
      ['人文社科', '历史、哲学、社会学等'],
      ['艺术设计', '美术、设计、音乐、摄影'],
      ['少儿读物', '儿童文学、绘本、科普'],
      ['外语学习', '英语、日语等外语学习书籍'],
      ['生活百科', '美食、健康、旅行等生活类']
    ];

    for (const category of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
        category
      );
    }
    console.log('✅ 分类数据插入完成');

    // 插入测试用户
    const testUsers = [
      ['admin', 'admin@example.com', '123456', '13800138000', '管理员', 1, 5.0],
      ['张三', 'zhangsan@example.com', '123456', '13800138001', '张三', 1, 4.8],
      ['李四', 'lisi@example.com', '123456', '13800138002', '李四', 1, 4.6],
      ['王五', 'wangwu@example.com', '123456', '13800138003', '王五', 1, 4.9]
    ];

    for (const user of testUsers) {
      const [username, email, password, phone, realName, isVerified, rating] = user;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.execute(`
        INSERT IGNORE INTO users (username, email, password, phone, real_name, is_verified, rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [username, email, hashedPassword, phone, realName, isVerified, rating]);
    }
    console.log('✅ 测试用户数据插入完成');

    // 插入测试图书
    const testBooks = [
      // 编号, 书名, 作者, 出版社, ISBN, 分类ID, 卖家ID, 原价, 售价, 品相, 描述, 位置
      [1, 'JavaScript高级程序设计', 'Nicholas C.Zakas', '人民邮电出版社', '9787115275790', 4, 2, 129.00, 89.00, 9, '经典JavaScript权威指南，前端开发必读', '北京市海淀区'],
      [2, '红楼梦', '曹雪芹', '人民文学出版社', '9787020002207', 1, 3, 59.70, 39.00, 8, '中国古典文学四大名著之一', '上海市浦东新区'],
      [3, '高等数学', '同济大学数学系', '高等教育出版社', '9787040396638', 2, 4, 35.80, 25.00, 7, '大学理工科基础教材', '广州市天河区'],
      [4, '人类简史', '尤瓦尔·赫拉利', '中信出版社', '9787508660752', 6, 2, 68.00, 45.00, 9, '从动物到上帝，人类发展史', '北京市朝阳区'],
      [5, 'Python编程从入门到实践', 'Eric Matthes', '人民邮电出版社', '9787115428028', 4, 3, 89.00, 65.00, 8, 'Python入门实战教程', '深圳市南山区'],
      [6, '深入理解计算机系统', 'Randal E.Bryant', '机械工业出版社', '9787111321330', 4, 2, 139.00, 95.00, 8, '程序员必读经典之作', '北京市海淀区'],
      [7, '活着', '余华', '作家出版社', '9787506391207', 1, 3, 35.00, 28.00, 9, '感人至深的当代文学作品', '上海市浦东新区'],
      [8, '算法导论', 'Thomas H.Cormen', '机械工业出版社', '9787111407010', 4, 4, 128.00, 88.00, 7, '计算机算法经典教材', '广州市天河区'],
      [9, '经济学原理', '曼昆', '北京大学出版社', '9787301278986', 5, 2, 88.00, 59.00, 9, '经济学入门经典教材', '北京市朝阳区'],
      [10, '设计心理学', '唐纳德·诺曼', '中信出版社', '9787508644575', 7, 3, 48.00, 35.00, 8, '设计思维启蒙读物', '深圳市南山区']
    ];

    for (const book of testBooks) {
      await connection.execute(`
        INSERT INTO books (title, author, publisher, isbn, category_id, seller_id, 
                           original_price, selling_price, condition_level, description, location, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待售')
      `, book);
    }
    console.log('✅ 测试图书数据插入完成');

    console.log('\n🎉 MySQL数据库初始化完成！');
    console.log('\n📋 测试账号信息：');
    console.log('管理员账号：admin / 123456');
    console.log('测试账号：张三 / 123456');
    console.log('测试账号：李四 / 123456');
    console.log('测试账号：王五 / 123456');
    
    console.log('\n📊 数据统计：');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const [bookCount] = await connection.execute('SELECT COUNT(*) as count FROM books');
    
    console.log(`用户数量: ${userCount[0].count}`);
    console.log(`分类数量: ${categoryCount[0].count}`);
    console.log(`图书数量: ${bookCount[0].count}`);

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📝 数据库连接已关闭');
    }
  }
}

initMySQL();