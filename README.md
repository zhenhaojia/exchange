# 📚 二手书交易市场

一个现代化的二手书交易Web应用，使用React + TypeScript + Material-UI构建。

## 🌟 功能特性

### 🏠 首页
- 精选推荐图书展示
- 热门分类浏览
- 平台数据统计
- 响应式设计

### 🔍 图书浏览
- 图书列表展示
- 多条件筛选（分类、成色、价格等）
- 搜索功能
- 排序选项（最新、价格、评分等）
- 分页加载

### 📖 图书详情
- 详细图书信息展示
- 多图片预览
- 卖家信息展示
- 用户评价系统
- 相关图书推荐

### 📝 发布图书
- 分步骤发布流程
- 图片上传
- 图书信息填写
- 成色说明
- 实时预览

### 👤 用户系统
- 用户注册/登录
- 个人资料管理
- 发布的图书管理
- 交易订单查看
- 收藏夹功能

### 🛒 购物车
- 商品添加/删除
- 数量调整
- 批量结算
- 订单确认流程
- 支付方式选择

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Material-UI (MUI)
- **样式方案**: Tailwind CSS
- **路由管理**: React Router DOM
- **状态管理**: React Hooks
- **图标库**: React Icons + Material-UI Icons

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   └── Navbar.tsx      # 导航栏组件
├── pages/               # 页面组件
│   ├── Home.tsx         # 首页
│   ├── BookList.tsx     # 图书列表
│   ├── BookDetail.tsx   # 图书详情
│   ├── PostBook.tsx     # 发布图书
│   ├── Login.tsx        # 登录页面
│   ├── Register.tsx     # 注册页面
│   ├── Profile.tsx      # 个人中心
│   └── Cart.tsx         # 购物车
├── App.tsx              # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 🎨 设计特色

- **现代化UI**: 采用Material Design设计语言
- **响应式布局**: 完美适配桌面端和移动端
- **用户体验**: 流畅的交互动画和友好的操作反馈
- **无障碍设计**: 遵循WCAG无障碍标准

## 📱 功能亮点

### 智能搜索
- 支持图书标题和作者搜索
- 实时搜索建议
- 搜索历史记录

### 精准筛选
- 多维度筛选条件
- 筛选条件组合
- 筛选结果实时更新

### 便捷发布
- 分步骤引导发布
- 图片批量上传
- 实时预览效果
- 智能定价建议

### 安全交易
- 用户实名认证
- 订单状态跟踪
- 评价系统
- 消息通知

## 🔧 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 组件采用函数式写法
- 使用React Hooks管理状态

### 样式规范
- 优先使用Material-UI组件
- 辅助使用Tailwind CSS类名
- 响应式设计优先
- 遵循Material Design设计原则

## 🌐 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至开发团队

---

**让闲置图书重新发光，让知识传递价值！** 📚✨