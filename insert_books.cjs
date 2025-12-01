const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertBooks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'secondhand_books'
  });
  
  const testBooks = [
    [1, 'JavaScript高级程序设计', 'Nicholas C.Zakas', '人民邮电出版社', '9787115275790', 4, 2, 129.00, 89.00, 9, '经典JavaScript权威指南，前端开发必读', '北京市海淀区'],
    [2, '红楼梦', '曹雪芹', '人民文学出版社', '9787020002207', 1, 3, 59.70, 39.00, 8, '中国古典文学四大名著之一', '上海市浦东新区'],
    [3, '高等数学', '同济大学数学系', '高等教育出版社', '9787040396638', 2, 4, 35.80, 25.00, 7, '大学理工科基础教材', '广州市天河区'],
    [4, '人类简史', '尤瓦尔·赫拉利', '中信出版社', '9787508660752', 6, 2, 68.00, 45.00, 9, '从动物到上帝，人类发展史', '北京市朝阳区'],
    [5, 'Python编程从入门到实践', 'Eric Matthes', '人民邮电出版社', '9787115428028', 4, 3, 89.00, 65.00, 8, 'Python入门实战教程', '深圳市南山区']
  ];
  
  for (let i = 0; i < testBooks.length; i++) {
    try {
      await connection.execute(
        'INSERT INTO books (title, author, publisher, isbn, category_id, seller_id, original_price, selling_price, condition_level, description, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [...testBooks[i], '待售']
      );
      console.log(`✅ 图书 ${i+1} 插入成功`);
    } catch (error) {
      console.log(`❌ 图书 ${i+1} 插入失败: ${error.message}`);
    }
  }
  
  const [count] = await connection.execute('SELECT COUNT(*) as total FROM books');
  console.log(`📊 总共插入了 ${count[0].total} 本图书`);
  await connection.end();
}

insertBooks();