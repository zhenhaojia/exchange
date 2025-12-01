const mysql = require('mysql2/promise');

async function testConnectionWithoutPassword() {
  console.log('尝试不使用密码连接MySQL...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // 空密码
      database: 'mysql'
    });
    
    console.log('✅ 无密码连接成功！');
    
    // 检查用户
    const [users] = await connection.execute('SELECT User, Host FROM mysql.user WHERE User = "root"');
    console.log('Root用户:');
    users.forEach(user => {
      console.log(`  用户: ${user.User}, 主机: ${user.Host}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ 无密码连接失败:', error.message);
    
    // 尝试使用常见密码
    const commonPasswords = ['root', '123456', 'password', 'mysql'];
    
    for (const pwd of commonPasswords) {
      try {
        console.log(`尝试密码: ${pwd}`);
        const conn = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: pwd
        });
        console.log(`✅ 密码 "${pwd}" 连接成功！`);
        await conn.end();
        break;
      } catch (e) {
        console.log(`❌ 密码 "${pwd}" 连接失败`);
      }
    }
  }
}

testConnectionWithoutPassword();