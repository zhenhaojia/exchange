-- 修复字段名不匹配问题
-- 将 cover_url 重命名为 cover_image 以匹配前端代码

-- 1. 添加 cover_image 字段
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. 将 cover_url 的值复制到 cover_image
UPDATE books SET cover_image = cover_url WHERE cover_url IS NOT NULL;

-- 3. 删除旧的 cover_url 字段（可选）
-- ALTER TABLE books DROP COLUMN IF EXISTS cover_url;

-- 4. 确保其他字段也存在
ALTER TABLE books ADD COLUMN IF NOT EXISTS exchange_count INTEGER DEFAULT 0;

-- 5. 添加一些缺失的字段（如果不存在）
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS isbn TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- 6. 查看修复结果
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books' 
  AND table_schema = 'public'
  AND column_name IN ('cover_image', 'cover_url', 'exchange_count', 'isbn', 'location')
ORDER BY column_name;

-- 7. 显示一些图书数据
SELECT 
  id,
  title,
  author,
  category,
  exchange_coins,
  cover_image IS NOT NULL as has_cover,
  exchange_count,
  status
FROM books 
LIMIT 5;

SELECT 'SUCCESS: 字段名已修复！现在前端应该能正确显示图书数据了。' as status;