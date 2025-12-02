# 二手书交易平台 (Second-hand Books Exchange Platform)

一个现代化的二手书交易网站，支持用户注册登录、图书发布、搜索购买、订单管理等功能。

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Material-UI (MUI)** - 现代化UI组件库
- **React Router** - 单页应用路由
- **Axios** - HTTP客户端
- **Vite** - 快速构建工具

### 后端
- **Node.js** - 服务器运行环境
- **Express** - Web应用框架
- **MySQL** - 关系型数据库
- **JWT** - 身份认证
- **Multer** - 文件上传处理
- **bcryptjs** - 密码加密

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目
```bash
git clone https://github.com/zhenhaojia/exchange.git
cd exchange
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=secondhand_books
DB_CHARSET=utf8mb4

# 服务器配置
SERVER_PORT=3001

# JWT密钥
JWT_SECRET=your_jwt_secret_key
```

### 4. 数据库初始化
```bash
node init_mysql_simple.cjs
```

### 5. 启动项目

#### 启动MySQL版本（推荐）
```bash
npm run dev:full
```

#### 启动SQLite版本（备用）
```bash
npm run dev:sqlite
```

#### 分别启动
```bash
# 启动后端
npm run server  # MySQL版本
npm run server-sqlite  # SQLite版本

# 启动前端
npm run dev
```

## 📱 功能特性

### 核心功能
- ✅ 用户注册/登录
- ✅ 图书浏览/搜索
- ✅ 图书发布/管理
- ✅ 购物车功能
- ✅ 订单管理
- ✅ 用户资料管理
- ✅ 图片上传

### 高级功能
- 🔍 多条件搜索筛选
- 📱 响应式设计
- 🏷️ 图书分类管理
- 💬 用户评价系统
- 📍 位置交易
- 📊 数据统计

## 📋 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| 张三 | 123456 | 普通用户 |
| 李四 | 123456 | 普通用户 |
| 王五 | 123456 | 普通用户 |

## 📁 项目结构

```
exchange/
├── src/                    # 前端源码
│   ├── components/         # 通用组件
│   ├── pages/             # 页面组件
│   ├── services/          # API服务
│   └── types/             # TypeScript类型
├── server.js              # MySQL版本后端
├── server_sqlite.cjs       # SQLite版本后端
├── database.sql           # 数据库结构
├── init_mysql_simple.cjs   # MySQL初始化脚本
└── public/                # 静态资源
```

## 🎯 部署说明

### 生产环境构建
```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview
```

### 环境变量
生产环境需要配置以下环境变量：
- `DB_HOST` - 数据库主机
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称
- `JWT_SECRET` - JWT密钥

## 🐛 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 确认数据库用户名密码正确
- 检查防火墙设置

### 2. 端口冲突
- 默认前端端口：5173
- 默认后端端口：3001
- 可通过环境变量修改

### 3. 图片上传失败
- 检查 `uploads/` 目录权限
- 确认文件大小限制

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 项目讨论区

---

⭐ 如果这个项目对您有帮助，请给个 Star！