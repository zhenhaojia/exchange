-- 快速修复邮箱验证问题
-- 将所有用户的邮箱设置为已验证

-- 方法1：更新所有未验证的用户
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 方法2：如果只想更新特定用户，使用这个（替换成实际的邮箱）
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'user@example.com';

-- 查看更新结果
SELECT 
  email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '已验证'
    ELSE '未验证'
  END as email_status,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

SELECT 'SUCCESS: 邮箱验证状态已更新！所有用户现在都可以直接登录。' as status;