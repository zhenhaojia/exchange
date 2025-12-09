# Supabase 认证问题检查清单

## 1. 项目设置检查
- [ ] 登录 [Supabase Dashboard](https://app.supabase.com)
- [ ] 选择你的项目 (bnvplojnzfmoupdgtpch)
- [ ] 进入 **Settings** -> **API** 检查：
  - Project URL: https://bnvplojnzfmoupdgtpch.supabase.co
  - Anon Key 是否正确

## 2. 认证设置检查
- [ ] 进入 **Authentication** -> **Settings**
- [ ] 检查以下设置：
  - **Enable email confirmations** - 暂时关闭测试
  - **Enable phone confirmations** - 暂时关闭
  - **Site URL**: 设置为 http://localhost:3000
  - **Redirect URLs**: 添加 http://localhost:3000/**

## 3. 数据库检查
在 **Database** -> **SQL Editor** 中执行：
1. `diagnose_supabase_auth.sql` - 诊断问题
2. `fix_supabase_auth.sql` - 修复问题

## 4. RLS 策略检查
- [ ] 进入 **Authentication** -> **Policies**
- [ ] 确保 users 表有正确的 RLS 策略
- [ ] 检查 **Database** -> **Tables** -> **users** 的权限

## 5. 触发器检查
- [ ] 进入 **Database** -> **Triggers**
- [ ] 确保 `on_auth_user_created` 触发器存在
- [ ] 检查 `handle_new_user()` 函数

## 6. 测试步骤
1. **暂时禁用邮箱验证**
2. **执行修复脚本**
3. **测试注册功能**
4. **检查 users 表是否有新记录**
5. **测试登录功能**

## 常见问题解决

### 问题1: "Database error saving new user"
**原因**: 触发器函数错误或 RLS 策略冲突
**解决**: 执行 `fix_supabase_auth.sql`

### 问题2: "new row for relation violates check constraint"
**原因**: 表约束问题
**解决**: 检查表结构，确保所有必需字段有默认值

### 问题3: "insufficient_privilege"
**原因**: RLS 策略或权限问题
**解决**: 更新 RLS 策略，授权正确的角色

### 问题4: 邮箱验证问题
**原因**: SMTP 配置或邮件模板问题
**解决**: 暂时禁用邮箱验证进行测试