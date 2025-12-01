const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('尝试连接MySQL数据库...');
  console.log('配置信息:');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Password:', process.env.DB_PASSWORD ? '已设置' : '未设置');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'secondhand_books',
      charset: process.env.DB_CHARSET || 'utf8mb4'
    });
    
    console.log('✅ MySQL连接成功！');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('MySQL版本:', rows[0].version);
    
    // 检查表是否存在
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('现有表数量:', tables.length);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ MySQL连接失败:');
    console.error('错误代码:', error.code);
    console.error('错误信息:', error.message);
    console.error('SQL状态:', error.sqlState);
    
    // 提供一些建议
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 可能的解决方案:');
      console.log('1. 检查MySQL用户名和密码是否正确');
      console.log('2. 确认MySQL服务正在运行');
      console.log('3. 尝试在MySQL中重新设置密码');
      console.log('4. 检查用户是否有访问该数据库的权限');
    }
  }
}

testConnection();