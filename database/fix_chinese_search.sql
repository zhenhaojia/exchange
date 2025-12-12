-- Exchange Cloud 数据库修复脚本
-- 修复中文全文搜索配置问题

-- 1. 删除有问题的索引
DROP INDEX IF EXISTS idx_books_title_author;

-- 2. 使用 simple 配置重新创建索引（适用于所有语言）
CREATE INDEX IF NOT EXISTS idx_books_title_author ON books USING gin(to_tsvector('simple', title || ' ' || author));

-- 3. 可选：安装中文全文搜索扩展（需要超级用户权限）
-- 如果您有超级用户权限，可以取消下面这行的注释
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. 可选：使用拼音搜索的函数（需要额外配置）
-- CREATE OR REPLACE FUNCTION search_books(query_text TEXT)
-- RETURNS TABLE (
--   id UUID,
--   title TEXT,
--   author TEXT,
--   category TEXT,
--   rank REAL
-- ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT 
--     b.id,
--     b.title,
--     b.author,
--     b.category,
--     ts_rank(
--       to_tsvector('simple', b.title || ' ' || b.author || ' ' || COALESCE(b.description, '')),
--       plainto_tsquery('simple', query_text)
--     ) as rank
--   FROM books b
--   WHERE 
--     b.status = 'available' AND (
--       to_tsvector('simple', b.title || ' ' || b.author || ' ' || COALESCE(b.description, '')) 
--       @@ plainto_tsquery('simple', query_text) OR
--       b.title ILIKE '%' || query_text || '%' OR
--       b.author ILIKE '%' || query_text || '%' OR
--       b.category ILIKE '%' || query_text || '%'
--     )
--   ORDER BY rank DESC, b.created_at DESC;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 验证索引创建是否成功
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'books' AND indexname = 'idx_books_title_author';

-- 6. 测试搜索功能（可选）
-- SELECT title, author FROM books 
-- WHERE to_tsvector('simple', title || ' ' || author) @@ plainto_tsquery('simple', 'test')
-- LIMIT 5;

COMMIT;