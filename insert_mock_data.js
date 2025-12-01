const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'secondhand_books',
  charset: 'utf8mb4'
};

async function insertMockData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('开始插入模拟数据...');

    // 插入用户数据
    const users = [
      { username: '张三', email: 'zhangsan@example.com', password: '123456', phone: '13800138001' },
      { username: '李四', email: 'lisi@example.com', password: '123456', phone: '13800138002' },
      { username: '王五', email: 'wangwu@example.com', password: '123456', phone: '13800138003' },
      { username: '赵六', email: 'zhaoliu@example.com', password: '123456', phone: '13800138004' },
      { username: '钱七', email: 'qianqi@example.com', password: '123456', phone: '13800138005' }
    ];

    const userIds = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password, phone, rating, total_sales) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, user.email, hashedPassword, user.phone, 4.5 + Math.random(), Math.floor(Math.random() * 50)]
      );
      userIds.push(result.insertId);
    }

    console.log('✓ 用户数据插入完成');

    // 插入分类数据（已经在database.sql中插入，这里获取分类ID）
    const [categories] = await connection.execute('SELECT id, name FROM categories');
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
        seller_id: userIds[0],
        original_price: 129.00,
        selling_price: 65.00,
        condition_level: '九成新',
        description: '经典JavaScript权威指南，内容全面，适合前端开发者学习。书页整洁无划痕，无缺页。',
        location: '北京市朝阳区',
        delivery_methods: JSON.stringify(['快递', '同城面交']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i1/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '深入理解计算机系统',
        author: 'Randal E.Bryant',
        publisher: '机械工业出版社',
        isbn: '9787111321330',
        category_id: categoryMap['计算机科技'],
        seller_id: userIds[1],
        original_price: 139.00,
        selling_price: 89.00,
        condition_level: '八成新',
        description: '计算机系统经典教材，深入浅出讲解计算机原理。书脊有轻微磨损，内页完好。',
        location: '上海市浦东新区',
        delivery_methods: JSON.stringify(['快递', '邮寄']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i2/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '人间失格',
        author: '太宰治',
        publisher: '作家出版社',
        isbn: '9787506374763',
        category_id: categoryMap['文学小说'],
        seller_id: userIds[2],
        original_price: 28.00,
        selling_price: 15.00,
        condition_level: '九成新',
        description: '日本文学经典，太宰治代表作。书页全新，有轻微折痕。',
        location: '广州市天河区',
        delivery_methods: JSON.stringify(['快递', '同城面交', '邮寄']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i3/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '活着',
        author: '余华',
        publisher: '作家出版社',
        isbn: '9787506365437',
        category_id: categoryMap['文学小说'],
        seller_id: userIds[3],
        original_price: 35.00,
        selling_price: 18.00,
        condition_level: '全新',
        description: '余华经典作品，感人至深的人生故事。全新未拆封。',
        location: '深圳市南山区',
        delivery_methods: JSON.stringify(['快递', '同城面交']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i4/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '经济学的思维方式',
        author: '托马斯·索维尔',
        publisher: '中信出版社',
        isbn: '9787508663368',
        category_id: categoryMap['经济管理'],
        seller_id: userIds[4],
        original_price: 68.00,
        selling_price: 38.00,
        condition_level: '八成新',
        description: '经济学入门经典，用通俗易懂的方式解释经济学原理。书角有轻微磨损。',
        location: '杭州市西湖区',
        delivery_methods: JSON.stringify(['快递', '邮寄']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i5/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '高等数学（第七版）',
        author: '同济大学数学系',
        publisher: '高等教育出版社',
        isbn: '9787040396638',
        category_id: categoryMap['教材教辅'],
        seller_id: userIds[0],
        original_price: 39.80,
        selling_price: 20.00,
        condition_level: '七成新',
        description: '大学经典教材，理工科必备。有笔记和划线，但整体完好。',
        location: '北京市海淀区',
        delivery_methods: JSON.stringify(['同城面交', '快递']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i1/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '设计中的设计',
        author: '原研哉',
        publisher: '广西师范大学出版社',
        isbn: '9787563384447',
        category_id: categoryMap['艺术设计'],
        seller_id: userIds[1],
        original_price: 98.00,
        selling_price: 58.00,
        condition_level: '九成新',
        description: '设计大师原研哉代表作，设计理念深刻。印刷精美，保存良好。',
        location: '上海市徐汇区',
        delivery_methods: JSON.stringify(['快递', '同城面交']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i2/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '万历十五年',
        author: '黄仁宇',
        publisher: '三联书店',
        isbn: '9787108015353',
        category_id: categoryMap['历史传记'],
        seller_id: userIds[2],
        original_price: 42.00,
        selling_price: 22.00,
        condition_level: '八成新',
        description: '历史学经典作品，从大历史的角度看明朝。书页微黄，但无缺页。',
        location: '成都市武侯区',
        delivery_methods: JSON.stringify(['快递', '邮寄']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i3/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '小王子',
        author: '安托万·德·圣埃克苏佩里',
        publisher: '人民文学出版社',
        isbn: '9787020042494',
        category_id: categoryMap['少儿读物'],
        seller_id: userIds[3],
        original_price: 22.00,
        selling_price: 12.00,
        condition_level: '全新',
        description: '经典童话故事，适合所有年龄段。全新精装版。',
        location: '西安市雁塔区',
        delivery_methods: JSON.stringify(['快递', '同城面交', '邮寄']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i4/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      },
      {
        title: '英语六级词汇词根+联想记忆法',
        author: '新东方考试研究中心',
        publisher: '北京语言大学出版社',
        isbn: '9787561944733',
        category_id: categoryMap['外语学习'],
        seller_id: userIds[4],
        original_price: 45.00,
        selling_price: 25.00,
        condition_level: '八成新',
        description: '六级考试必备词汇书，词根记忆法高效。有少量笔记。',
        location: '南京市鼓楼区',
        delivery_methods: JSON.stringify(['快递', '同城面交']),
        images: JSON.stringify([
          'https://img.alicdn.com/imgextra/i5/2206681226514/O1CN01Q7n7uS1z7z8Z7Z7Z7z_!!2206681226514.jpg'
        ])
      }
    ];

    const bookIds = [];
    for (const book of books) {
      const [result] = await connection.execute(`
        INSERT INTO books (
          title, author, publisher, isbn, category_id, seller_id,
          original_price, selling_price, condition_level, description,
          location, delivery_methods, images, view_count, favorite_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        book.title, book.author, book.publisher, book.isbn,
        book.category_id, book.seller_id, book.original_price,
        book.selling_price, book.condition_level, book.description,
        book.location, book.delivery_methods, book.images,
        Math.floor(Math.random() * 200), Math.floor(Math.random() * 50)
      ]);
      bookIds.push(result.insertId);
    }

    console.log('✓ 图书数据插入完成');

    // 插入一些购物车数据
    for (let i = 0; i < 5; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomBookId = bookIds[Math.floor(Math.random() * bookIds.length)];
      
      // 检查是否已经添加到购物车
      const [existing] = await connection.execute(
        'SELECT id FROM cart_items WHERE user_id = ? AND book_id = ?',
        [randomUserId, randomBookId]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)',
          [randomUserId, randomBookId, 1]
        );
      }
    }

    console.log('✓ 购物车数据插入完成');

    // 插入一些订单数据
    for (let i = 0; i < 8; i++) {
      const buyerId = userIds[Math.floor(Math.random() * userIds.length)];
      let sellerId = userIds[Math.floor(Math.random() * userIds.length)];
      let bookId = bookIds[Math.floor(Math.random() * bookIds.length)];
      
      // 确保买家和卖家不同
      while (sellerId === buyerId) {
        sellerId = userIds[Math.floor(Math.random() * userIds.length)];
      }

      // 获取图书信息
      const [bookData] = await connection.execute(
        'SELECT selling_price FROM books WHERE id = ?',
        [bookId]
      );

      if (bookData.length > 0) {
        const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5);
        const price = bookData[0].selling_price;
        const statuses = ['待付款', '待发货', '待收货', '已完成', '已取消'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        await connection.execute(`
          INSERT INTO orders (
            order_number, buyer_id, seller_id, book_id, quantity,
            price, total_amount, delivery_method, delivery_address, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderNumber, buyerId, sellerId, bookId, 1,
          price, price, '快递', '北京市朝阳区某某街道某某号', randomStatus
        ]);
      }
    }

    console.log('✓ 订单数据插入完成');

    // 插入一些评价数据
    const [orders] = await connection.execute('SELECT * FROM orders WHERE status = "已完成" LIMIT 5');
    
    for (const order of orders) {
      const ratings = [5, 4, 4, 5, 3];
      const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
      const reviews = [
        '书籍描述很准确，卖家发货很快，满意！',
        '书的质量比预期的还要好，值得推荐。',
        '包装很仔细，书本保存得很好，感谢卖家。',
        '价格实惠，书的内容也不错，推荐购买。',
        '卖家服务态度很好，交易愉快。'
      ];
      const randomReview = reviews[Math.floor(Math.random() * reviews.length)];

      await connection.execute(`
        INSERT INTO reviews (
          book_id, reviewer_id, reviewee_id, order_id, rating, content
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        order.book_id, order.buyer_id, order.seller_id, order.id,
        randomRating, randomReview
      ]);
    }

    console.log('✓ 评价数据插入完成');

    console.log('🎉 所有模拟数据插入完成！');
    console.log('\n测试账号：');
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户名: ${user.username}, 邮箱: ${user.email}, 密码: ${user.password}`);
    });

  } catch (error) {
    console.error('插入数据时出错:', error);
  } finally {
    await connection.end();
  }
}

insertMockData();