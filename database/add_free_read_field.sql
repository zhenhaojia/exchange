-- 为reading_sessions表添加免费阅读字段
-- 用于标记轮播图图书的免费阅读

-- 1. 添加免费阅读字段
ALTER TABLE reading_sessions 
ADD COLUMN IF NOT EXISTS is_free_read BOOLEAN DEFAULT FALSE;

-- 2. 添加索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_reading_sessions_free_read 
ON reading_sessions(is_free_read);

-- 3. 添加注释
COMMENT ON COLUMN reading_sessions.is_free_read IS '是否为免费阅读（如轮播图图书）';

SELECT 'SUCCESS: 免费阅读字段已添加到reading_sessions表' as status;