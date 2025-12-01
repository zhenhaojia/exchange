const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔍 测试MySQL连接...\n');

async function testConnection() {
  try {
    // 尝试不同的连接配置
    const configs = [
      {
        host: 'localhost',
        user: 'root',
        password: '200506050012zhj',
        name: 'localhost 密码连接'
      },
      {
        host: '127.0.0.1',
        user: 'root', 
        password: '200506050012zhj',
        name: '127.0.0.1 密码连接'
      },
      {
        host: 'localhost',
        user: 'root',
        password: '',
        name: 'localhost 无密码连接'
      },
      {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        name: '127.0.0.1 无密码连接'
      }
    ];

    for (const config of configs) {
      console.log(`🔗 测试配置: ${config.name}`);
      try {
        const connection = await mysql.createConnection({
          host: config.host,
          user: config.user,
          password: config.password
        });
        
        console.log('✅ 连接成功！');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log(`📋 MySQL版本: ${rows[0].version}`);
        
        // 查看现有数据库
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📊 现有数据库:');
        databases.forEach(db => {
          console.log(`   - ${db.Database}`);
        });
        
        await connection.end();
        console.log('✅ 连接已关闭\n');
        
        // 如果连接成功，使用这个配置
        console.log(`🎯 找到可用配置: ${config.name}`);
        return config;
        
      } catch (error) {
        console.log(`❌ 连接失败: ${error.message}\n`);
      }
    }
    
    console.log('💡 所有配置都失败了，请检查：');
    console.log('1. MySQL服务是否正在运行');
    console.log('2. root用户密码是否正确');
    console.log('3. 防火墙设置是否阻止连接');
    console.log('4. MySQL配置是否允许localhost连接');
    
    // 尝试启动MySQL服务
    console.log('\n🚀 尝试启动MySQL服务...');
    const { exec } = require('child_process');
    
    // Windows系统尝试启动MySQL
    exec('net start mysql', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 无法启动MySQL服务:', error.message);
        
        // 尝试其他可能的服务名
        exec('net start mysql80', (error2, stdout2, stderr2) => {
          if (error2) {
            console.log('❌ 无法启动MySQL80服务:', error2.message);
          } else {
            console.log('✅ MySQL80服务启动成功');
          }
        });
      } else {
        console.log('✅ MySQL服务启动成功');
        console.log(stdout);
      }
    });
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

testConnection();