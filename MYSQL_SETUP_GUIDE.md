# MySQL数据库设置指南

## 🚨 当前状态

检测到MySQL服务正在运行，但需要密码认证。请按以下步骤完成数据库设置：

## 🔧 方法一：配置MySQL密码

### 1. 设置MySQL root密码

如果你记得MySQL密码，请修改 `.env` 文件：

```bash
# 编辑 .env 文件
DB_PASSWORD=你的MySQL密码
```

### 2. 如果忘记密码，重置MySQL密码

#### Windows（使用XAMPP/WAMP）：
1. 停止MySQL服务
2. 找到my.ini或my.cnf文件
3. 在[mysqld]部分添加：`skip-grant-tables`
4. 重启MySQL服务
5. 连接MySQL：`mysql -u root`
6. 重置密码：
   ```sql
   USE mysql;
   UPDATE user SET authentication_string = PASSWORD('新密码') WHERE User = 'root';
   FLUSH PRIVILEGES;
   EXIT;
   ```
7. 移除skip-grant-tables并重启MySQL

#### macOS（使用Homebrew）：
```bash
brew services stop mysql
mysql.server start --skip-grant-tables
mysql -u root
```
然后执行上述SQL重置密码。

### 3. 创建数据库和表

设置好密码后，运行：
```bash
cd d:/桌面/exchange
node create_tables.cjs
node insert_mock_data.cjs
```

## 🔧 方法二：使用现有MySQL用户

如果你有其他MySQL用户，修改 `.env` 文件：

```bash
DB_USER=你的用户名
DB_PASSWORD=你的密码
DB_NAME=secondhand_books
```

## 🔧 方法三：创建新MySQL用户

1. 以root身份连接MySQL：
   ```bash
   mysql -u root -p
   ```

2. 创建新用户和数据库：
   ```sql
   CREATE DATABASE secondhand_books CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'booksuser'@'localhost' IDENTIFIED BY 'books123';
   GRANT ALL PRIVILEGES ON secondhand_books.* TO 'booksuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. 更新 `.env` 文件：
   ```bash
   DB_USER=booksuser
   DB_PASSWORD=books123
   DB_NAME=secondhand_books
   ```

4. 运行创建脚本：
   ```bash
   node create_tables.cjs
   node insert_mock_data.cjs
   ```

## 🔧 方法四：使用phpMyAdmin（推荐新手）

1. 打开浏览器访问：`http://localhost/phpmyadmin` 或 `http://localhost:8080`
2. 点击"新建数据库"
3. 数据库名：`secondhand_books`，字符集：`utf8mb4_unicode_ci`
4. 点击"SQL"标签页
5. 复制 `database.sql` 文件内容并执行
6. 更新 `.env` 文件中的数据库凭据
7. 运行模拟数据插入：`node insert_mock_data.cjs`

## 📱 方法五：使用Docker MySQL

如果没有本地MySQL，可以使用Docker：

```bash
# 拉取MySQL镜像
docker pull mysql:8.0

# 启动MySQL容器
docker run --name mysql-books -e MYSQL_ROOT_PASSWORD=books123 -e MYSQL_DATABASE=secondhand_books -p 3306:3306 -d mysql:8.0

# 更新.env文件
DB_PASSWORD=books123
```

## 🔄 验证设置

完成设置后，验证数据库连接：

```bash
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).then(() => console.log('✅ 数据库连接成功!')).catch(e => console.log('❌ 连接失败:', e.message));
"
```

## 🚀 启动项目

数据库设置完成后：

```bash
# 同时启动前后端
npm run dev:full

# 或分别启动
npm run server    # 后端服务
npm run dev        # 前端服务
```

## 📋 测试账号

数据库初始化后会创建以下测试账号：

| 用户名 | 邮箱 | 密码 |
|--------|------|------|
| 张三 | zhangsan@example.com | 123456 |
| 李四 | lisi@example.com | 123456 |
| 王五 | wangwu@example.com | 123456 |
| 赵六 | zhaoliu@example.com | 123456 |
| 钱七 | qianqi@example.com | 123456 |

## 🆘 故障排除

### 常见错误

1. **Access denied**: 检查用户名和密码
2. **Can't connect**: 确认MySQL服务运行状态
3. **Unknown database**: 运行数据库创建脚本
4. **Table doesn't exist**: 运行表创建脚本

### 调试命令

```bash
# 检查MySQL服务
netstat -an | findstr 3306

# 查看MySQL进程
tasklist | findstr mysql

# 测试连接
mysql -u 用户名 -p -e "SHOW DATABASES;"
```

---

**完成数据库设置后，你就可以使用完整的二手书交易系统了！** 🎉