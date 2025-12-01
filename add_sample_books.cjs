const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleBooks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'secondhand_books'
  });
  
  const books = [
    {
      title: 'Python编程从入门到实践',
      author: 'Eric Matthes',
      publisher: '人民邮电出版社',
      isbn: '9787115428028',
      category_id: 4,
      seller_id: 3,
      original_price: 89.00,
      selling_price: 65.00,
      condition_level: 8,
      description: 'Python入门实战教程，适合零基础学习',
      location: '深圳市南山区'
    },
    {
      title: '红楼梦',
      author: '曹雪芹',
      publisher: '人民文学出版社',
      isbn: '9787020002207',
      category_id: 1,
      seller_id: 3,
      original_price: 59.70,
      selling_price: 39.00,
      condition_level: 8,
      description: '中国古典文学四大名著之一',
      location: '上海市浦东新区'
    },
    {
      title: '高等数学',
      author: '同济大学数学系',
      publisher: '高等教育出版社',
      isbn: '9787040396638',
      category_id: 2,
      seller_id: 4,
      original_price: 35.80,
      selling_price: 25.00,
      condition_level: 7,
      description: '大学理工科基础教材',
      location: '广州市天河区'
    },
    {
      title: '人类简史',
      author: '尤瓦尔·赫拉利',
      publisher: '中信出版社',
      isbn: '9787508660752',
      category_id: 6,
      seller_id: 2,
      original_price: 68.00,
      selling_price: 45.00,
      condition_level: 9,
      description: '从动物到上帝，人类发展史',
      location: '北京市朝阳区'
    },
    {
      title: '深入理解计算机系统',
      author: 'Randal E.Bryant',
      publisher: '机械工业出版社',
      isbn: '9787111321330',
      category_id: 4,
      seller_id: 2,
      original_price: 139.00,
      selling_price: 95.00,
      condition_level: 8,
      description: '程序员必读经典之作',
      location: '北京市海淀区'
    }
  ];
  
  console.log('开始添加示例图书...');
  
  for (let i = 0; i < books.length; i++) {
    try {
      const book = books[i];
      await connection.execute(
        'INSERT INTO books (title, author, publisher, isbn, category_id, seller_id, original_price, selling_price, condition_level, description, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [book.title, book.author, book.publisher, book.isbn, book.category_id, book.seller_id, book.original_price, book.selling_price, book.condition_level, book.description, book.location, '待售']
      );
      console.log(`✅ 《${book.title}》添加成功`);
    } catch (error) {
      console.log(`❌ 图书 ${i+1} 插入失败: ${error.message}`);
    }
  }
  
  const [count] = await connection.execute('SELECT COUNT(*) as total FROM books');
  console.log(`\n📊 当前数据库中共有 ${count[0].total} 本图书`);
  
  // 查看用户信息
  const [users] = await connection.execute('SELECT id, username, email FROM users');
  console.log('\n👥 测试用户信息:');
  users.forEach(user => {
    console.log(`ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}`);
  });
  
  await connection.end();
  console.log('\n🎉 数据库初始化完成！');
}

addSampleBooks();