# Exchange Cloud - 公益二手书交流平台

一个基于React + Supabase的公益性质二手书交流平台，采用虚拟币经济系统，让知识免费传递，让阅读改变生活。

## 🌟 项目特色

- **公益性质**：所有图书免费使用虚拟币交换，降低知识获取门槛
- **虚拟币经济**：完善的虚拟币获取和消费机制
- **AI智能推荐**：集成豆包AI，提供个性化图书推荐
- **每日签到**：签到奖励和阅读激励系统
- **响应式设计**：支持PC端和移动端完美体验

## 🚀 功能模块

### 用户系统
- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 用户等级和经验系统
- ✅ 头像上传

### 虚拟币系统
- ✅ 注册奖励（50币）
- ✅ 每日签到奖励（10币）
- ✅ 阅读推荐奖励（5币）
- ✅ 图书交换消费（20币）
- ✅ 在线阅读消费（5币）
- ✅ 交易记录管理

### 图书系统
- ✅ 图书发布和管理
- ✅ 图书搜索和筛选
- ✅ 图书详情展示
- ✅ 图书交换申请
- ✅ 在线阅读功能

### AI推荐系统
- ✅ 个性化图书推荐
- ✅ 搜索助手功能
- ✅ 读书建议服务
- ✅ 聊天式交互界面

### 每日功能
- ✅ 每日签到系统
- ✅ 精选图书推荐
- ✅ 签到日历展示
- ✅ 连续签到统计

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **Ant Design** - UI组件库
- **Framer Motion** - 动画库
- **React Router** - 路由管理
- **Zustand** - 状态管理

### 后端服务
- **Supabase** - 数据库和认证服务
- **豆包AI** - 智能推荐服务

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript** - 类型检查

## 📦 安装部署

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/exchange-cloud.git
cd exchange-cloud
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 豆包AI API Configuration
VITE_DOUBAO_API_KEY=your_doubao_api_key
VITE_DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3

# App Configuration
VITE_APP_NAME=Exchange Cloud - 公益二手书交流平台
VITE_APP_VERSION=1.0.0
```

4. **启动开发服务器**
```bash
npm run dev
```

项目将在 http://localhost:3000 启动

### 生产部署

1. **构建项目**
```bash
npm run build
```

2. **预览构建结果**
```bash
npm run preview
```

3. **部署到静态托管服务**
将 `dist` 目录部署到 Vercel、Netlify 等静态托管服务。

## 📊 数据库配置

### Supabase 数据库表结构

需要在Supabase中创建以下表：

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  coins INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  daily_check_in_last TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 图书表
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  description TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  owner_id UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'available',
  exchange_coins INTEGER DEFAULT 20,
  read_coins INTEGER DEFAULT 5,
  condition TEXT DEFAULT 'good',
  location TEXT,
  exchange_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 交换记录表
CREATE TABLE exchanges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) NOT NULL,
  from_user_id UUID REFERENCES users(id) NOT NULL,
  to_user_id UUID REFERENCES users(id) NOT NULL,
  coins INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 虚拟币交易表
CREATE TABLE coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 每日推荐表
CREATE TABLE daily_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) NOT NULL,
  recommend_reason TEXT NOT NULL,
  bonus_coins INTEGER DEFAULT 5,
  is_read BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_books_owner_id ON books(owner_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_exchanges_from_user ON exchanges(from_user_id);
CREATE INDEX idx_exchanges_to_user ON exchanges(to_user_id);
CREATE INDEX idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX idx_daily_recommendations_date ON daily_recommendations(date);

-- 创建存储过程
CREATE OR REPLACE FUNCTION add_user_coins(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET coins = coins + amount, updated_at = NOW() WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deduct_user_coins(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET coins = coins - amount, updated_at = NOW() 
  WHERE id = user_id AND coins >= amount;
END;
$$ LANGUAGE plpgsql;
```

### 行级安全策略

```sql
-- 用户表RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 图书表RLS策略
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available books" ON books
  FOR SELECT USING (status = 'available');

CREATE POLICY "Users can manage own books" ON books
  FOR ALL USING (auth.uid() = owner_id);

-- 其他表的RLS策略...
```

## 🎯 项目结构

```
exchange-cloud/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   ├── Navbar.tsx      # 导航栏
│   │   ├── Footer.tsx      # 页脚
│   │   └── ProtectedRoute.tsx # 路由保护
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Login.tsx       # 登录页
│   │   ├── Register.tsx    # 注册页
│   │   ├── BookList.tsx    # 图书列表
│   │   ├── BookDetail.tsx  # 图书详情
│   │   ├── Profile.tsx     # 个人中心
│   │   ├── DailyCheckIn.tsx # 每日签到
│   │   ├── AIRecommend.tsx # AI推荐
│   │   └── CoinCenter.tsx  # 虚拟币中心
│   ├── services/           # 服务层
│   │   ├── auth.ts         # 认证服务
│   │   ├── books.ts        # 图书服务
│   │   ├── coins.ts        # 虚拟币服务
│   │   ├── doubao.ts       # AI服务
│   │   └── supabase.ts     # 数据库服务
│   ├── stores/             # 状态管理
│   │   ├── authStore.ts    # 认证状态
│   │   └── coinStore.ts    # 虚拟币状态
│   ├── types/              # 类型定义
│   │   └── index.ts
│   ├── constants/          # 常量定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   └── helpers.ts
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
└── README.md               # 项目说明
```

## 🔧 开发指南

### 代码规范

项目使用ESLint进行代码质量检查，提交前请确保：
```bash
npm run lint
```

### 类型检查

```bash
npm run type-check
```

### 构建测试

```bash
npm run build
```

## 🌐 API文档

### Supabase API
- **认证**: `/auth/v1/`
- **数据库**: `/rest/v1/`
- **存储**: `/storage/v1/`

### 豆包AI API
- **聊天完成**: `/chat/completions`
- **模型**: ep-20241205142441-7v72r

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面框架
- [Supabase](https://supabase.com/) - 后端即服务平台
- [Ant Design](https://ant.design/) - UI组件库
- [豆包AI](https://www.doubao.com/) - AI推荐服务

## 📞 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-username/exchange-cloud)
- 问题反馈: [Issues](https://github.com/your-username/exchange-cloud/issues)
- 邮箱: your-email@example.com

---

**Exchange Cloud** - 让知识传递温暖，让阅读改变生活 ❤️