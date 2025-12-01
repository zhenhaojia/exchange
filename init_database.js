const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始初始化二手书交易系统数据库...\n');

// 检查MySQL连接并执行SQL文件
function executeSQL(sqlFile, description) {
  return new Promise((resolve, reject) => {
    console.log(`正在${description}...`);
    
    // 使用MySQL命令行工具执行SQL文件
    // 使用密码连接MySQL
    const command = `mysql -u root -p200506050012zhj < "${sqlFile}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${description}失败:`, error.message);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`⚠️  ${description}警告:`, stderr);
      }
      
      console.log(`✅ ${description}完成`);
      resolve();
    });
  });
}

async function initDatabase() {
  try {
    // 1. 创建数据库表结构
    await executeSQL('database.sql', '创建数据库表结构');
    
    // 2. 插入模拟数据
    await executeSQL('insert_mock_data.js', '插入模拟数据');
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('\n接下来您可以：');
    console.log('1. 启动后端服务器: npm run server');
    console.log('2. 启动前端开发服务器: npm run dev');
    console.log('3. 或者同时启动前后端: npm run dev:full');
    console.log('\n测试账号信息请查看上面的输出');
    
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    console.log('\n请检查：');
    console.log('1. MySQL服务是否已启动');
    console.log('2. MySQL root用户密码是否正确');
    console.log('3. 确保有足够的数据库权限');
    
    // 如果MySQL命令失败，提供手动执行的指导
    console.log('\n🔧 手动执行方式：');
    console.log('1. 打开MySQL客户端:');
    console.log('   mysql -u root -p');
    console.log('2. 执行数据库脚本:');
    console.log('   source database.sql;');
    console.log('3. 插入模拟数据:');
    console.log('   node insert_mock_data.js');
  }
}

initDatabase();