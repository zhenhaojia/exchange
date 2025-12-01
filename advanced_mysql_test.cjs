const mysql = require('mysql2/promise');

console.log('🔍 高级MySQL连接测试...\n');

async function testAdvancedConnections() {
  const configs = [
    {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '200506050012zhj.',
      database: undefined,
      name: '标准配置'
    },
    {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '200506050012zhj.',
      database: undefined,
      name: 'IP地址配置'
    },
    {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '200506050012zhj.',
      database: 'mysql',
      name: '连接到mysql系统数据库'
    },
    {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '200506050012zhj.',
      charset: 'utf8mb4',
      name: '指定字符集'
    },
    {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '200506050012zhj.',
      connectTimeout: 10000,
      name: '增加超时时间'
    }
  ];

  for (const config of configs) {
    console.log(`\n🔗 测试配置: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port || 3306}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '已设置' : '未设置'}`);
    if (config.database) console.log(`   Database: ${config.database}`);
    
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        charset: config.charset,
        connectTimeout: config.connectTimeout
      });
      
      console.log('✅ 连接成功！');
      
      // 测试查询
      const [rows] = await connection.execute('SELECT VERSION() as version, USER() as user');
      console.log(`   MySQL版本: ${rows[0].version}`);
      console.log(`   当前用户: ${rows[0].user}`);
      
      // 查看现有数据库
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('   现有数据库:');
      databases.forEach(db => {
        console.log(`     - ${db.Database}`);
      });
      
      await connection.end();
      console.log('✅ 连接已关闭\n');
      
      // 如果连接成功，尝试创建目标数据库
      console.log('🎯 尝试创建secondhand_books数据库...');
      const connection2 = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
      });
      
      await connection2.execute('CREATE DATABASE IF NOT EXISTS secondhand_books CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ 数据库创建成功');
      
      await connection2.end();
      
      return config; // 返回成功的配置
      
    } catch (error) {
      console.log(`❌ 连接失败: ${error.message}`);
      console.log(`   错误代码: ${error.code || '未知'}`);
    }
  }
  
  console.log('\n💡 所有配置都失败了。');
  console.log('🔍 可能的解决方案:');
  console.log('1. 检查MySQL是否为XAMPP、WAMPP或其他集成环境的一部分');
  console.log('2. 尝试重置root密码');
  console.log('3. 检查MySQL配置文件(my.cnf或my.ini)');
  console.log('4. 尝试使用图形界面工具(如phpMyAdmin、MySQL Workbench)连接');
  
  return null;
}

testAdvancedConnections();