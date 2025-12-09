# 豆包AI API 配置说明

## 🔧 如何配置豆包AI服务

### 1. 获取API Key

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 登录账号并进入「火山方舟」服务
3. 在左侧导航栏选择「安全管理」→「API Key 管理」
4. 点击「新建API Key」创建新的API Key
5. 复制生成的API Key（格式通常为 `ak-` 开头）

### 2. 环境变量配置

在项目根目录的 `.env` 文件中添加以下配置：

```env
# 豆包AI API Configuration
VITE_DOUBAO_API_KEY=ak-your-actual-api-key-here
VITE_DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
```

### 3. 支持的模型

目前支持以下豆包模型：
- `Doubao-lite-4k` - 轻量版，4K上下文
- `Doubao-lite-32k` - 轻量版，32K上下文  
- `Doubao-pro-4k` - 专业版，4K上下文
- `Doubao-pro-32k` - 专业版，32K上下文

### 4. 修改模型

如需更换模型，在 `src/services/doubao.ts` 中修改模型名称：

```typescript
model: 'Doubao-lite-4k'  // 修改为您想要使用的模型
```

### 5. 测试配置

配置完成后，访问AI推荐页面测试功能。如果API Key无效，系统会自动使用模拟响应，确保应用正常运行。

### 6. 故障排除

**常见错误：**
- `401 Unauthorized`: API Key 无效或格式错误
- `404 Not Found`: API 端点地址错误
- `403 Forbidden`: 权限不足

**解决方案：**
1. 检查API Key是否正确复制
2. 确认API Key格式为 `ak-` 开头
3. 验证API Key是否有访问权限
4. 检查网络连接是否正常

### 7. Fallback机制

当API不可用时，应用会自动使用预设的模拟响应，确保用户仍能获得基本的推荐和搜索建议。

---

**注意：** 请妥善保管您的API Key，不要提交到版本控制系统。