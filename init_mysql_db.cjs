const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 开始初始化二手书交易系统数据库...\n');

// 数据库连接配置（不指定数据库名，先创建数据库）
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '200506050012zhj',
  charset: 'utf8mb4'
};

async function initDatabase() {
  let connection;
  
  try {
    // 1. 连接MySQL服务器（不指定数据库）
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL服务器连接成功');

    // 2. 创建数据库
    const dbName = process.env.DB_NAME || 'secondhand_books';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 "${dbName}" 创建成功`);

    // 3. 切换到目标数据库
    await connection.changeUser({ database: dbName });
    console.log(`✅ 已切换到数据库 "${dbName}"`);

    // 4. 读取并执行表结构SQL
    const sqlFile = fs.readFileSync('database.sql', 'utf8');
    const statements = sqlFile.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log('📋 开始创建数据库表...');
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    console.log('✅ 数据库表创建完成');

    // 5. 检查是否有模拟数据需要插入
    console.log('📝 准备插入初始数据...');
    
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

    const bcrypt = require('bcryptjs');
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
      [5, 'Python编程从入门到实践', 'Eric Matthes', '人民邮电出版社', '9787115428028', 4, 3, 89.00, 65.00, 8, 'Python入门实战教程', '深圳市南山区']
    ];

    for (const book of testBooks) {
      await connection.execute(`
        INSERT INTO books (title, author, publisher, isbn, category_id, seller_id, 
                          original_price, selling_price, condition_level, description, location, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待售')
      `, book);
    }
    console.log('✅ 测试图书数据插入完成');

    console.log('\n🎉 数据库初始化完成！');
    console.log('\n📋 测试账号信息：');
    console.log('管理员账号：admin / 123456');
    console.log('测试账号：张三 / 123456');
    console.log('测试账号：李四 / 123456');
    console.log('测试账号：王五 / 123456');
    
    console.log('\n🚀 接下来您可以：');
    console.log('1. 启动后端服务器: npm run server');
    console.log('2. 启动前端开发服务器: npm run dev');
    console.log('3. 或者同时启动前后端: npm run dev:full');

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    console.log('\n🔍 请检查：');
    console.log('1. MySQL服务是否已启动');
    console.log('2. MySQL连接配置是否正确');
    console.log('3. 数据库文件权限是否正确');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📝 数据库连接已关闭');
    }
  }
}

initDatabase();