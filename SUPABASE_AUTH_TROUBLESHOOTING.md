# Supabase 认证问题完整解决方案

## 🚨 当前问题
注册时出现 500 Internal Server Error，错误信息："Database error saving new user"

## 📋 立即可用的临时方案
当前应用已配置**紧急认证模式**：
- ✅ 自动检测 Supabase 错误
- ✅ 切换到本地存储模式
- ✅ 保持完整功能测试
- ✅ 数据存储在浏览器 localStorage

## 🔧 永久修复步骤

### 步骤 1: 诊断问题
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目：bnvplojnzfmoupdgtpch
3. 进入 **Database** -> **SQL Editor**
4. 执行 `database/diagnose_supabase_auth.sql`

### 步骤 2: 修复数据库
在同一个 SQL 编辑器中执行：
```sql
-- 复制 database/fix_supabase_auth.sql 的内容
```

### 步骤 3: 检查认证设置
在 Supabase 控制台中：
1. **Authentication** -> **Settings**
2. **暂时禁用邮箱验证** (测试时)
3. 设置 **Site URL**: `http://localhost:3000`
4. **Redirect URLs**: 添加 `http://localhost:3000/**`

### 步骤 4: 测试修复
1. 禁用紧急模式：在浏览器控制台执行：
   ```javascript
   localStorage.removeItem('emergency_auth_mode')
   ```
2. 尝试注册新用户
3. 检查数据库是否有新记录

## 🛠️ 手动修复步骤

### 如果自动修复失败，手动执行：

1. **删除 users 表**
   ```sql
   DROP TABLE IF EXISTS public.users CASCADE;
   ```

2. **重新创建 users 表**
   ```sql
   CREATE TABLE public.users (
       id UUID NOT NULL PRIMARY KEY,
       email TEXT NOT NULL UNIQUE,
       username TEXT NOT NULL UNIQUE,
       coins INTEGER NOT NULL DEFAULT 50,
       exp INTEGER NOT NULL DEFAULT 0,
       avatar_url TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **创建触发器函数**
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO public.users (id, email, username, coins, exp)
       VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
           50,
           0
       );
       RETURN NEW;
   EXCEPTION
       WHEN OTHERS THEN
           RAISE WARNING '创建用户资料失败: %', SQLERRM;
           RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **创建触发器**
   ```sql
   CREATE TRIGGER on_auth_user_created
       AFTER INSERT ON auth.users
       FOR EACH ROW
       EXECUTE FUNCTION public.handle_new_user();
   ```

5. **设置 RLS**
   ```sql
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own profile" ON public.users
       FOR SELECT USING (auth.uid() = id);
       
   CREATE POLICY "Users can update own profile" ON public.users
       FOR UPDATE USING (auth.uid() = id);
   ```

## 📝 常见错误代码对照表

| 错误代码 | 问题描述 | 解决方案 |
|---------|---------|---------|
| `500` + "Database error saving new user" | 触发器或表结构问题 | 执行修复脚本 |
| `23514` + "violates check constraint" | 字段约束问题 | 检查表结构和约束 |
| `42501` + "insufficient_privilege" | 权限或 RLS 问题 | 更新 RLS 策略 |
| `PGRST116` + "Table not found" | 表不存在 | 重新创建表 |
| `PGRST204` + "Column not found" | 列不存在 | 检查表结构 |

## 🔍 调试技巧

### 1. 检查现有表结构
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
```

### 2. 检查触发器
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'auth.users';
```

### 3. 检查 RLS 策略
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### 4. 检查最近注册的用户
```sql
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

## 📞 需要帮助？

如果以上步骤都无法解决问题：
1. 确保你执行了所有诊断和修复脚本
2. 检查 Supabase 项目是否有足够的权限
3. 尝试创建一个新的 Supabase 项目进行测试
4. 查看 Supabase 的 [故障状态页面](https://status.supabase.com)

## 📝 备注信息
- 项目 URL: https://bnvplojnzfmoupdgtpch.supabase.co
- 当前使用紧急模式，数据存储在本地
- 修复完成后记得测试完整功能流程