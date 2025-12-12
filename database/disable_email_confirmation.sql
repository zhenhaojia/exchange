-- 临时禁用邮箱验证（仅用于开发测试）
-- 注意：生产环境不应该这样做

-- 1. 为所有用户标记邮箱已验证
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. 更新特定用户的邮箱验证状态
-- 如果您知道要更新的用户邮箱，可以使用：
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'your-email@example.com';

-- 3. 查看更新结果
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

SELECT 'SUCCESS: 邮箱验证已设置为已确认！现在用户可以直接登录。' as status;