-- 修复用户表字段问题
-- 添加缺失的 avatar 字段

-- 1. 添加 avatar 字段到用户表
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 为了兼容前端，创建 avatar 字段（指向 avatar_url）
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 3. 将 avatar_url 的值复制到 avatar
UPDATE users SET avatar = avatar_url WHERE avatar_url IS NOT NULL;

-- 4. 检查用户表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('avatar', 'avatar_url')
ORDER BY column_name;

-- 5. 查看用户数据
SELECT id, username, email, avatar IS NOT NULL as has_avatar, avatar_url IS NOT NULL as has_avatar_url
FROM users 
LIMIT 5;

SELECT 'SUCCESS: 用户表字段已修复！现在应该能正确获取图书数据了。' as status;