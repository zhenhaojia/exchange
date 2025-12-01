const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 智能数据库初始化...\n');

const DB_FILE = './secondhand_books.db';

async function initSQLite() {
  console.log('📱 使用SQLite数据库...');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('✅ SQLite数据库连接成功');
      
      // 创建表结构
      const createTables = `
        -- 用户表
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          real_name VARCHAR(50),
          avatar VARCHAR(255),
          is_verified BOOLEAN DEFAULT 0,
          rating DECIMAL(2,1) DEFAULT 5.0,
          total_sales INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 分类表
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(50) NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 图书表
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(100) NOT NULL,
          publisher VARCHAR(100),
          isbn VARCHAR(20),
          category_id INTEGER,
          seller_id INTEGER NOT NULL,
          original_price DECIMAL(10,2),
          selling_price DECIMAL(10,2) NOT NULL,
          condition_level INTEGER DEFAULT 5,
          description TEXT,
          images TEXT,
          location VARCHAR(255),
          delivery_methods TEXT,
          status VARCHAR(20) DEFAULT '待售',
          view_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id),
          FOREIGN KEY (seller_id) REFERENCES users(id)
        );

        -- 购物车表
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (book_id) REFERENCES books(id)
        );

        -- 订单表
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          buyer_id INTEGER NOT NULL,
          seller_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          price DECIMAL(10,2) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(20) DEFAULT '待付款',
          delivery_method VARCHAR(50),
          delivery_address TEXT,
          buyer_note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (buyer_id) REFERENCES users(id),
          FOREIGN KEY (seller_id) REFERENCES users(id),
          FOREIGN KEY (book_id) REFERENCES books(id)
        );
      `;
      
      db.exec(createTables, async (err) => {
        if (err) {
          console.error('❌ 创建表失败:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ 数据库表创建成功');
        
        try {
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
            await new Promise((resolveCategory) => {
              db.run(
                'INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
                category,
                resolveCategory
              );
            });
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
            
            await new Promise((resolveUser) => {
              db.run(`
                INSERT OR IGNORE INTO users (username, email, password, phone, real_name, is_verified, rating) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [username, email, hashedPassword, phone, realName, isVerified, rating], resolveUser);
            });
          }
          console.log('✅ 测试用户数据插入完成');

          // 插入测试图书
          const testBooks = [
            // 编号, 书名, 作者, 出版社, ISBN, 分类ID, 卖家ID, 原价, 售价, 品相, 描述, 位置
            [1, 'JavaScript高级程序设计', 'Nicholas C.Zakas', '人民邮电出版社', '9787115275790', 4, 2, 129.00, 89.00, 9, '经典JavaScript权威指南，前端开发必读', '北京市海淀区'],
            [2, '红楼梦', '曹雪芹', '人民文学出版社', '9787020002207', 1, 3, 59.70, 39.00, 8, '中国古典文学四大名著之一', '上海市浦东新区'],
            [3, '高等数学', '同济大学数学系', '高等教育出版社', '9787040396638', 2, 4, 35.80, 25.00, 7, '大学理工科基础教材', '广州市天河区'],
            [4, '人类简史', '尤瓦尔·赫拉利', '中信出版社', '9787508660752', 6, 2, 68.00, 45.00, 9, '从动物到上帝，人类发展史', '北京市朝阳区'],
            [5, 'Python编程从入门到实践', 'Eric Matthes', '人民邮电出版社', '9787115428028', 4, 3, 89.00, 65.00, 8, 'Python入门实战教程', '深圳市南山区']
          ];

          for (const book of testBooks) {
            await new Promise((resolveBook) => {
              db.run(`
                INSERT INTO books (title, author, publisher, isbn, category_id, seller_id, 
                                   original_price, selling_price, condition_level, description, location, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待售')
              `, book, resolveBook);
            });
          }
          console.log('✅ 测试图书数据插入完成');

          console.log('\n🎉 SQLite数据库初始化完成！');
          console.log('\n📋 测试账号信息：');
          console.log('管理员账号：admin / 123456');
          console.log('测试账号：张三 / 123456');
          console.log('测试账号：李四 / 123456');
          console.log('测试账号：王五 / 123456');
          
          console.log('\n🚀 接下来您可以：');
          console.log('1. 启动SQLite版本服务器: npm run server-sqlite');
          console.log('2. 启动前端开发服务器: npm run dev');
          console.log('3. 或者同时启动: npm run dev:sqlite');

          db.close((closeErr) => {
            if (closeErr) {
              console.error('关闭数据库时出错:', closeErr.message);
            } else {
              console.log('📝 数据库连接已关闭');
            }
          });
          
          resolve();
          
        } catch (error) {
          console.error('❌ 插入数据失败:', error.message);
          reject(error);
        }
      });
    });
  });
}

async function checkMySQL() {
  console.log('🔍 检查MySQL可用性...');
  
  try {
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '200506050012zhj'
    });
    
    console.log('✅ MySQL连接可用');
    await connection.end();
    return true;
    
  } catch (error) {
    console.log('❌ MySQL连接不可用:', error.message);
    return false;
  }
}

async function main() {
  try {
    // 检查MySQL是否可用
    const mysqlAvailable = await checkMySQL();
    
    if (mysqlAvailable) {
      console.log('\n🎯 建议使用MySQL数据库，请运行:');
      console.log('   node init_mysql_db.cjs');
    } else {
      console.log('\n🔄 MySQL不可用，将使用SQLite数据库');
      await initSQLite();
    }
    
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
  }
}

main();